import {GlobalHead} from "../components/GlobalHead";
import Layout from "../components/Layout";

export default function Custom404() {
  return (
      <>
        <GlobalHead/>
        <Layout>
          <main className="flex h-full w-full flex-col justify-center text-center">
            <h1 className="text-5xl font-bold">404</h1>
            <p className="text-xl">Not Found!</p>
          </main>
        </Layout>
      </>
  );
}
