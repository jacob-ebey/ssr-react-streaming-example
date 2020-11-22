import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import Navigation from "../components/Navigation";

export default function Index() {
  return (
    <>
      <Helmet>
        <title>A Home</title>
      </Helmet>

      <h1>A Home Page</h1>

      <Navigation />
    </>
  );
}
