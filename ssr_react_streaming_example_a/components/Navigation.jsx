import React from "react";
import { Link } from "react-router-dom";

export default function Navigation() {
  return (
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/test">Test</Link>
      </li>
      <li>
        <Link to="/b">B Home</Link>
      </li>
      <li>
        <Link to="/b/test">B Test</Link>
      </li>
    </ul>
  );
}
