// Example file demonstrating the no-alias-imports rule
/* eslint-disable no-unused-vars */

// ❌ These will be flagged by the rule:
// import Button from '@/components/Button';
// import utils from '~/utils/helpers';
// const config = require('@/config/app');
// export { Modal } from '@/components/Modal';

// ✅ These are allowed:
import React from "react";
import Button from "./components/Button";
import utils from "../utils/helpers";
const fs = require("fs");
const config = require("./config/app");
export { Modal } from "./components/Modal";

console.log(
  "Example file - uncomment the flagged imports to see the rule in action!"
);
