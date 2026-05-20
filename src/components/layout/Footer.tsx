import { getCompany } from '@/lib/company'
import FooterClient from './FooterClient'

const menuItems = [
  { title: 'Products', href: '/products' },
  { title: 'Articles', href: '/articles' },
  { title: 'About', href: '/about' },
  { title: 'Testing', href: '/testing' },
]

export async function Footer() {
  const company = await getCompany()

  return <FooterClient company={company} menuItems={menuItems} />
}
