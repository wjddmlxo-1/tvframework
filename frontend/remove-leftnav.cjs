const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "src", "pages");
const files = [];
function walk(d) {
  const entries = fs.readdirSync(d, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".tsx") || e.name.endsWith(".jsx")) files.push(p);
  }
}
walk(dir);

for (const f of files) {
  let s = fs.readFileSync(f, "utf8");
  if (!s.includes("LeftNav")) continue;
  const before = s;
  s = s.replace(/\nimport \{ default as LeftNav \} from "@\/components\/leftmenu\/LeftNav\w+";\n/g, "\n");
  s = s.replace(/\s*\{\/\* <!-- Navigation --> \*\/\}\n\s*<LeftNav\s*\/?>\s*(<\/LeftNav>)?\n\s*\{\/\* <!--\/\/ Navigation --> \*\/\}\n\n?/g, "\n");
  if (s !== before) {
    fs.writeFileSync(f, s);
    console.log("Updated", f);
  }
}
