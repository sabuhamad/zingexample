import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import TrustedBy from './components/TrustedBy';
import Services from './components/Services';
import PartneredWith from './components/PartneredWith';
import GrowthPartner from './components/GrowthPartner';
import Founders from './components/Founders';
import Footer from './components/Footer';

function App() {
  return (
    <div className="font-roboto bg-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <TrustedBy />
        <Services />
        <PartneredWith />
        <GrowthPartner />
        <Founders />
      </main>
      <Footer />
    </div>
  );
}

export default App;
