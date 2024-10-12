const { Anthropic } = require('@anthropic-ai/sdk');
const Shopify = require('shopify-api-node');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const shopify = new Shopify({
  shopName: 'your-shop-name.myshopify.com',
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_API_SECRET,
});

module.exports = async (req, res) => {
  const { businessName, businessInfo } = req.body;

  try {
    // Fetch products from Shopify
    const products = await shopify.product.list();

    // Process products and generate tags
    for (const product of products) {
      const prompt = `You are writing for ${businessName}. ${businessInfo} Generate tags for the following product:\nTitle: ${product.title}\nDescription: ${product.body_html}\nCurrent Tags: ${product.tags}\nNew Tags:`;

      const response = await anthropic.completions.create({
        model: 'claude-3-sonnet-20240620',
        prompt: prompt,
        max_tokens_to_sample: 300,
      });

      const newTags = response.completion.trim().split(',').map(tag => tag.trim());

      // Update product tags
      await shopify.product.update(product.id, {
        tags: [...new Set([...product.tags.split(','), ...newTags])].join(','),
      });
    }

    // Generate collections based on tags
    const allTags = [...new Set(products.flatMap(product => product.tags.split(',')))];

    for (const tag of allTags) {
      const titlePrompt = `Generate an SEO-Optimized title for a collection based on the tag: ${tag}. This is for ${businessName} selling ${businessInfo}. Use words like cheap, affordable, and buy at least once.`;
      const titleResponse = await anthropic.completions.create({
        model: 'claude-3-sonnet-20240620',
        prompt: titlePrompt,
        max_tokens_to_sample: 100,
      });

      const descriptionPrompt = `Generate a brief HTML description for a collection based on the tag: ${tag}. This is for ${businessName} selling ${businessInfo}. Write 300 characters of a <p> description.`;
      const descriptionResponse = await anthropic.completions.create({
        model: 'claude-3-sonnet-20240620',
        prompt: descriptionPrompt,
        max_tokens_to_sample: 300,
      });

      await shopify.smartCollection.create({
        title: titleResponse.completion.trim(),
        body_html: descriptionResponse.completion.trim(),
        rules: [{ column: 'tag', relation: 'equals', condition: tag }],
      });
    }

    res.status(200).json({ message: 'Products tagged and collections created successfully!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while processing products.' });
  }
};