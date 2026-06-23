export default async function handler(req, res) {
  const number = req.query.number;

  if (!number) {
    return res.status(400).json({ error: "Please provide a number. Example: ?number=+8801XXXXXXXXX" });
  }

  const token = process.env.NUMVERIFY_TOKEN;

  try {
    const response = await fetch(`http://apilayer.net/api/validate?access_key=${token}&number=${number}&country_code=&format=1`);
    const data = await response.json();

    if (!data.valid) {
      return res.status(200).json({
        valid: false,
        number: number,
        message: "Invalid or unrecognized number",
        developer: "SprialXHub",
        telegram: "@SprialX1"
      });
    }

    let ownerName = "Not Available";
    try {
      const nameRes = await fetch(`https://lookups.twilio.com/v1/PhoneNumbers/${encodeURIComponent(number)}?Type=caller-name`, {
        headers: {
          Authorization: "Basic " + Buffer.from(`${process.env.TWILIO_SID}:${process.env.TWILIO_TOKEN}`).toString("base64")
        }
      });
      const nameData = await nameRes.json();
      if (nameData.caller_name && nameData.caller_name.caller_name) {
        ownerName = nameData.caller_name.caller_name;
      }
    } catch (e) {
      ownerName = "Not Available";
    }

    return res.status(200).json({
      valid: data.valid,
      number: data.international_format,
      local_format: data.local_format,
      country: data.country_name,
      country_code: data.country_code,
      location: data.location || "Unknown",
      carrier: data.carrier || "Unknown",
      line_type: data.line_type,
      owner_name: ownerName,
      developer: "SprialXHub",
      telegram: "@SprialX1"
    });

  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
