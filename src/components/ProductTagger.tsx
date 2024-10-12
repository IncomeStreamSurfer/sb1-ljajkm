import React, { useState } from 'react';
import { Page, Layout, Card, Button, TextField, Banner } from '@shopify/polaris';
import axios from 'axios';

export function ProductTagger() {
  const [businessName, setBusinessName] = useState('');
  const [businessInfo, setBusinessInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/tag-products', { businessName, businessInfo });
      setResult(response.data.message);
    } catch (error) {
      setResult('An error occurred while tagging products.');
    }
    setLoading(false);
  };

  return (
    <Page title="Product Tagger">
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <TextField
              label="Business Name"
              value={businessName}
              onChange={setBusinessName}
              autoComplete="off"
            />
            <TextField
              label="Business Information"
              value={businessInfo}
              onChange={setBusinessInfo}
              multiline={4}
              autoComplete="off"
            />
            <Button onClick={handleSubmit} loading={loading} primary>
              Tag Products
            </Button>
          </Card>
        </Layout.Section>
        {result && (
          <Layout.Section>
            <Banner status="success">{result}</Banner>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}