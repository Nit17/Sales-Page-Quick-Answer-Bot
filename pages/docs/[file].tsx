import fs from 'fs'
import path from 'path'

export async function getServerSideProps({ params }: { params: { file: string } }) {
  const fileName = params.file
  const p = path.join(process.cwd(), 'data', 'docs', fileName)
  if (!fs.existsSync(p)) return { notFound: true }
  const raw = fs.readFileSync(p, 'utf8')
  return { props: { raw, fileName } }
}

export default function Doc({ raw, fileName }: { raw: string; fileName: string }) {
  return (
    <main className="container">
      <h1>Doc: {fileName}</h1>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{raw}</pre>
    </main>
  )
}
