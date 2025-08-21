import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  
};

export default withPWA({
  dest: "public",
  disable: "false", // Change to false if testing locally
  register: true,
  skipWaiting: true,
})(nextConfig);
