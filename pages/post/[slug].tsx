import { GetStaticProps } from 'next'
import Head from 'next/head'
import Header from '../../components/Header'
import { sanityClient, urlFor } from '../../sanity'
import { Post } from '../../typings'
import PortableText from 'react-portable-text'
import {useForm, SubmitHandler} from 'react-hook-form'
import { useState } from 'react'

interface Props {
  post: Post
}

interface IFormInput{
  _id: string,
  name: string,
  email: string,
  comment: string,
}

function Post({post}: Props) {
  const [submitted,setSubmitted] = useState(false)
  const { register, handleSubmit, formState: {errors} } = useForm<IFormInput>()

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    await fetch('/api/createComment', {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then(() => {
        console.log((data))
        setSubmitted(true)
      })
      .catch(err => {
        console.log(err)
        setSubmitted(false)
      })
  }

  return (
    <main>
      <Head>
        <title>DonBlog - {post.title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <img className='w-full h-40 object-cover' src={urlFor(post.mainImage).url()} alt='Main image' />

      <article className='max-w-3xl mx-auto p-5'>
        <h1 className='text-3xl mt-10 mb-3'>{post.title}</h1>
        <h2 className='text-xl font-light text-gray-500 mb-2' >{post.description}</h2>
      
        <div className='flex items-center space-x-2'>
          <img className='h-10 w-10 rounded-full' src={urlFor(post.author.image).url()} alt="Author Image" />
          <p className='font-extralight text-sm'>Blog post by <span className='text-gray-500'>{post.author.name}</span> - Published at {new Date(post._createdAt).toLocaleString()}</p>
        </div>

        <div className='mt-10'>
          <PortableText 
            content={post.body} 
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!} 
            projectId={process.env.NEXT_PUBLIC_PROJECT_ID!}
            serializers={{
                h1: (props: any) => <h1 className="text-2xl font-bold my-5" {...props} />,
                h2: (props: any) => <h1 className='text-xl font-bold my-5' {...props} />,
                li: ({children}: any) => <li className='ml-4 list-disc'>{children}</li>,
                link: ({href,children}: any) => <a href={href} className='text-blue-500 hover:underline'> {children} </a>,
                h3: (props: any) => <h1 className='text-l font-bold my-5' {...props} />,
              }}
            />
        </div>

      </article>

      <hr className='max-w-lg my-5 mx-auto border border-gray-500' />

      {submitted ? (
        <div className="flex space-x-2 justify-center mb-10">
          <div className="bg-white shadow-lg mx-auto w-96 max-w-full text-sm pointer-events-auto bg-clip-padding rounded-lg block" role="alert"  aria-live="assertive" aria-atomic="true" data-mdb-autohide="false">
            <div className="p-3 bg-white rounded-b-lg break-words text-gray-700">
              <h3 className='text-2xl font-bold'>Comment submitted!</h3>
              <p>Once approved, it will appear below!</p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col p-5 my-10 max-w-2xl mx-auto mb-10 '>
        <h3 className='text-sm text-gray-500'>Did you enjoy your read?</h3>
        <h4 className='text-3xl font-bold'>Leave a comment down below!</h4>
        <hr className='py-3 mt-2' />

        <input type="hidden" value={post._id} {...register("_id")} />

        <label className='block mb-5'>
          <span className='text-gray-700'>Name</span>
          <input {...register("name", {required: true})} className='shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-gray-500 focus:ring outline-none' type="text" placeholder='Name'/>
          {errors.name && <span className='text-red-400'>Name is required*</span>}
        </label>
        <label className='block mb-5'>
          <span className='text-gray-700'>Email</span>
          <input {...register("email", {required: true})} className='shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-gray-500 focus:ring outline-none' type="email" placeholder='Email'/>
          {errors.email && <span className='text-red-400'>Email is required*</span>}
        </label>
        <label className='block mb-5'>
          <span className='text-gray-700'>Comment</span>
          <textarea {...register("comment", {required: true})} className='shadow border rounded py-2 px-3 form-textarea mt-1 block w-full ring-gray-500 outline-none focus:ring resize-none' placeholder='Comment here' rows={8}/>
          {errors.comment && <span className='text-red-400'>Comment is required*</span>}
        </label>

        <input className='bg-gray-500 hover:bg-gray-400 focus:shadow-outline focus:outline-none text-white font-bold  py-2 px-4 rounded cursor-pointer' type="submit" />
      </form>
      )}

      <div className='flex flex-col p-10 my-10 max-w-2xl mx-auto shadow-gray-500 space-y-2 shadow rounded'>
        <h3 className='text-3xl'>Approved Comments</h3>
        <hr className='pb-2'/>

        {post.comments.map((comment) => (
          <div key={comment._id}>
            <p><span className='text-gray-500'>{comment.name}</span> : {comment.comment}</p>
          </div>
        ))}
      </div>

    </main>
  )
}

export default Post

export const getStaticPaths = async () => {
  const query = `*[_type=="post"]{
    _id,
    slug {
    current
   }
  }`

  const posts = await sanityClient.fetch(query)

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current
    }
  }))

  return {
    paths,
    fallback: 'blocking',
  }
}


export const getStaticProps: GetStaticProps = async ({params}) => {
  const query = `
    *[_type=="post" && slug.current == $slug][0]{
      _id,
      _createdAt,
      title,
      author->{
      name,
      image,
    },
    'comments': *[
      _type=="comment" &&
      post._ref == ^._id &&
      approved==true
    ],
    description,
    mainImage,
    slug,
    body
    }
  `

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  })

  if(!post) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      post,
    },
    revalidate: 60, // 60 seconds to ssr to update cache on client
  }
}
