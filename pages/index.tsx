import React from "react";
import Layout from "components/Layout";
import {GlobalHead} from "components/GlobalHead";

const Animated = ({className}: { className: string }) =>
    <div className={"absolute header-animation rounded-2 bg-base-100 overflow-hidden mask " + className}>
      <div
          className="w-12 h-12 extremely-thin-margin rounded-2 bg-gradient-to-r from-orange-400 to-red-500 opacity-50"></div>
    </div>

const Main = () => {
  return (
      <>
        <GlobalHead/>
        <Layout>
          <header className="header-class relative h-screen flex justify-center -mt-16">
            <Animated className="left-[25%] top-[30%] mask-squircle"/>
            <Animated className="left-[66%] top-[79%] mask-squircle"/>
            <Animated className="left-[60%] top-[20%] mask-triangle"/>
            <Animated className="left-[15%] top-[75%] mask-triangle"/>
            <Animated className="left-[40%] top-[66%] mask-hexagon"/>
            <Animated className="left-[80%] top-[55%] mask-hexagon"/>
            <div className="m-auto flex flex-col justify-center text-center">
              <h1 className="m-auto text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Socialtale</h1>
              <desc>Manage all your social media accounts with one dashboard!</desc>
            </div>
          </header>
        </Layout>
      </>
  );
};

export default Main;
