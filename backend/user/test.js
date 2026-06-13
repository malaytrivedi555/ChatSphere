import dns from "dns/promises";

try {
  const records = await dns.resolveSrv(
    "_mongodb._tcp.cluster0.oihryyv.mongodb.net"
  );
  console.log(records);
} catch (err) {
  console.error(err);
}