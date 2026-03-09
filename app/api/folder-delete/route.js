import ImageKit from "imagekit";

export async function POST() {
  const imageKit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
  });

  try {
    const response = await imageKit.deleteFolder("images");

    console.log(response);

    return Response.json({ success: true, response });

  } catch (error) {
    console.error(error);

    return Response.json({
      success: false,
      message: error.message
    });
  }
}