import React from 'react';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { ProductTagger } from './components/ProductTagger';

function App() {
  return (
    <AppProvider i18n={enTranslations}>
      <ProductTagger />
    </AppProvider>
  );
}

export default App;