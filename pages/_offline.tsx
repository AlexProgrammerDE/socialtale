import {GlobalHead} from "../components/GlobalHead";
import Layout from "../components/Layout";

export default function Offline() {
  return (
      <>
        <GlobalHead/>
        <Layout>
          <main className="flex h-full w-full flex-col justify-center text-center">
            <h1 className="text-5xl font-bold">You are offline!</h1>
            <p className="text-xl">Please connect to the internet to use PistonPost.</p>
          </main>
        </Layout>
      </>
  );
}
