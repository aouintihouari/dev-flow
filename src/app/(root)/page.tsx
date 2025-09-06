import { auth } from "../../../auth";

const Home = async () => {
  const session = await auth();
  console.log(session);

  return <></>;
};

export default Home;
