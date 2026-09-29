export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const samples = [
    { label: 'Plastic Water Bottle (PET #1)', category: 'Non-Biodegradable', query: 'plastic water bottle' },
    { label: 'Banana Fruit Peel', category: 'Biodegradable', query: 'banana fruit peel' },
    { label: 'Corrugated Shipping Box', category: 'Non-Biodegradable', query: 'corrugated shipping box' },
    { label: 'Aluminum Soda Can', category: 'Non-Biodegradable', query: 'aluminum beverage soda can' },
    { label: 'Clear Glass Pickle Jar', category: 'Non-Biodegradable', query: 'clear soda-lime glass jar' },
    { label: 'Discarded AA Alkaline Battery', category: 'Non-Biodegradable', query: 'aa alkaline battery e-waste' },
  ];

  return res.status(200).json({ samples });
}
