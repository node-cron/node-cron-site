import { createContentLoader } from 'vitepress'

interface Post {
  title: string
  url: string
  description: string
  date: string
  displayDate: string
}

declare const data: Post[]
export { data }

export default createContentLoader('blog/*.md', {
  transform(raw): Post[] {
    return raw
      // drop the index page itself
      .filter((page) => !page.url.endsWith('/blog/') && !page.url.endsWith('/blog/index'))
      .map(({ url, frontmatter }) => ({
        title: frontmatter.title as string,
        url,
        description: (frontmatter.description as string) ?? '',
        date: frontmatter.date as string,
        displayDate: new Date(frontmatter.date as string).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      }))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  },
})
