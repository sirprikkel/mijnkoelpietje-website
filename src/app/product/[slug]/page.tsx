export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <div className="max-w-6xl mx-auto px-6 pt-40 pb-20">TODO: product {slug}</div>;
}
