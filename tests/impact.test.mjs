import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("Impact Hub presents three features without fabricating financial activity", () => {
  const page = read("impact.html");
  for (const id of ['id="league"','id="matches"','id="proof"','id="interest"']) {
    assert.ok(page.includes(id), id);
  }
  for (const text of [
    "No verified donations", "No live rankings yet", "no sponsorship",
    "NOT A RECEIPT OR PROOF OF PAYMENT", "Contribution processed", "Bill payment confirmed"
  ]) {
    assert.match(page, new RegExp(text, "i"), text);
  }
  assert.match(page, /0 · Feature not active/);
  assert.doesNotMatch(page, /type="password"/i);
});

test("Impact Hub has a static Netlify form with validated role and consent", () => {
  const page = read("impact.html");
  assert.match(page, /<form name="onlybills-impact-interest"[^>]*data-netlify="true"/);
  assert.match(page, /netlify-honeypot="bot-field"/);
  assert.match(page, /action="\/impact-thanks"/);
  for(const field of ["form-name","email","name","organization","participant_type","priority","consent","referrer","campaign"]) {
    assert.match(page, new RegExp('name="' + field + '"'));
  }
  assert.match(page, /name="consent" value="yes" required/);
  assert.match(read("impact-thanks.html"), /Nobody has been charged/);
});

test("Impact Hub preview, leaderboard filters and nonbinding matching remain functional in source", () => {
  const page=read("impact.html");
  const script=page.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script);
  assert.doesNotThrow(()=>new Script(script));
  assert.match(script, /document\.querySelectorAll\("\[data-group\]"\)/);
  assert.match(script, /match-category/);
  assert.match(script, /match-ratio/);
  assert.match(script, /match-cap/);
  assert.match(script, /preview\(\)/);
  assert.match(script, /aria-selected/);
  assert.match(page, /aria-live="polite"/);
});

test("Impact Hub is discoverable from all public entrypoints", () => {
  const app=read("src/app.js");
  const idea=read("idea.html");
  const redirects=read("netlify.toml");
  assert.match(app, /Explore the Impact Hub/);
  assert.match(app, /<a href="\.\/impact">Impact Hub<\/a>/);
  assert.match(idea, /href="\/impact/);
  assert.match(redirects, /from = "\/impact"\s+to = "\/impact\.html"/);
  assert.match(read("impact-thanks.html"), /href="\/impact"/);
});

test("Impact Hub keeps only honest demo states, never generating donation tallies", () => {
  const page=read("impact.html");
  const script=page.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script);
  assert.doesNotMatch(script, /localStorage|setItem|fetch\(|XMLHttpRequest/i);
  assert.doesNotMatch(page, /Donate now|Pay this bill now|Total donated \$\d+/i);
});
