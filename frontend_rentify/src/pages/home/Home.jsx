import React from 'react'
import Banner from '../../components/Banner';
import Categories from './Categories';
import SpecialItems from './SpecialItems';
import Testimonials from './Testimonials';
import Footer from '../../components/Footer';
import OurServices from './OurServices';

const Home = () => {
  return (
    <div>
      <Banner/>
      <Categories/>
      <SpecialItems/>
      <Testimonials/>
      <OurServices/>
    </div>
  )
}

export default Home;