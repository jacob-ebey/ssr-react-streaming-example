import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import Navigation from "../components/Navigation";

export default function Test() {
  return (
    <>
      <Helmet>
        <title>A Test</title>
      </Helmet>

      <h1>A Test Page</h1>

      <Navigation />
    </>
  );
}
