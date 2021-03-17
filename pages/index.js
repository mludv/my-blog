import Container from '../components/container'
import Layout from '../components/layout'
import { getAllPosts } from '../lib/api'
import { TITLE } from '../lib/constants'
import Head from 'next/head'

function NavItem({className, children}) {
  return (
    <li className={`${className ? className : ''} w-full hover:bg-red-50`}>
      <a className="flex justify-center w-full" href="#">
        {children}
      </a>
    </li>
  );
}

function Nav() {
  return (
    <div>
      <ul className="flex justify-between text-xl border-b border-gray-200 divide-x">
        <NavItem className="hover:bg-red-50">home</NavItem>
        <NavItem className="hover:bg-blue-50">about</NavItem>
        <NavItem className="hover:bg-green-50">posts</NavItem>
      </ul>
    </div>
  )
}

function Intro() {
  return (
    <>
      <section className="flex flex-col items-center mt-16 mb-16 md:flex-row md:justify-between md:mb-12">
        <h1 className="text-6xl font-bold leading-tight tracking-tighter md:text-8xl md:pr-8">
          max ludvigsson
        </h1>
      </section>
      <section>
      <p className="text-2xl">
        I'm an ML Engineer currently creating data products at HSBC in Hong Kong.
      </p>
      </section>
    </>
  )
}

export default function Index() {
  return (
    <>
      <Layout>
        <Head>
          <title>{TITLE}</title>
        </Head>
        <Nav />
        <Container>
          <Intro />
        </Container>
      </Layout>
    </>
  )
}

export async function getStaticProps() {
  const allPosts = getAllPosts([
    'title',
    'date',
    'slug',
    'author',
    'coverImage',
    'excerpt',
  ])

  return {
    props: { allPosts },
  }
}
