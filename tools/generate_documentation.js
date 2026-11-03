// tools/generate_documentation.js
import fs from 'fs';
import path from 'path';

import { stylesAndHead } from './doc_modules/styles_and_head.js';
import { metaAndToc } from './doc_modules/meta_and_toc.js';
import { sectionFoundation } from './doc_modules/section_foundation.js';
import { sectionDb } from './doc_modules/section_db.js';
import { sectionFeaturesG1 } from './doc_modules/section_features_g1.js';
import { sectionFeaturesG2 } from './doc_modules/section_features_g2.js';
import { sectionFeaturesG3 } from './doc_modules/section_features_g3.js';
import { sectionFeaturesG4 } from './doc_modules/section_features_g4.js';
import { sectionFeaturesG5 } from './doc_modules/section_features_g5.js';
import { scriptsAndFooter } from './doc_modules/scripts_and_footer.js';

console.log("Compiling LifeGraph Technical Documentation...");

const fullHtml = [
  stylesAndHead,
  metaAndToc,
  sectionFoundation,
  sectionDb,
  sectionFeaturesG1,
  sectionFeaturesG2,
  sectionFeaturesG3,
  sectionFeaturesG4,
  sectionFeaturesG5,
  scriptsAndFooter
].join('\n');

const artifactPath = "C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\3848848c-71d6-485f-a3e5-a8c0dd84a1da\\lifegraph_game_system_documentation.html";
const workspacePath = "C:\\Users\\ADMIN\\.gemini\\antigravity\\scratch\\lifegraph\\docs\\lifegraph_game_system_documentation.html";

// Write to artifact directory
fs.writeFileSync(artifactPath, fullHtml, 'utf8');
console.log(`Successfully generated artifact documentation at: ${artifactPath}`);

// Write to workspace docs directory
fs.writeFileSync(workspacePath, fullHtml, 'utf8');
console.log(`Successfully generated workspace documentation at: ${workspacePath}`);

console.log(`Total HTML size: ${(Buffer.byteLength(fullHtml, 'utf8') / 1024).toFixed(2)} KB`);
console.log(`Total lines: ${fullHtml.split('\n').length}`);
