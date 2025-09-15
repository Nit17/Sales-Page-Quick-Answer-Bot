import Layout from '../components/Layout'

export default function Pricing() {
  return (
    <Layout>
      <h1>Pricing</h1>
      <p>Simple plans that scale with you.</p>
      {[...Array(20)].map((_, i) => (
        <p key={i}>Filler content line {i + 1} to allow scrolling and trigger the 70% scroll event.</p>
      ))}
    </Layout>
  )
}
