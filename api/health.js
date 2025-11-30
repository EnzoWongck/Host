export default function handler(req, res) {
  res.status(200).json({ 
    status: "27o is running", 
    time: new Date().toISOString(),
    version: "1.0.0"
  });
}

export const config = { 
  api: { 
    bodyParser: false 
  } 
};


