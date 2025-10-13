import HeroSection from '@/components/home/HeroSection'
import Navbar from '../components/layout/Navbar'
import CategoriesSection from '@/components/home/CategoriesSection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import Footer from '@/components/layout/Footer'

export default function Home() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
      <Footer />  
    </div>
  )
}