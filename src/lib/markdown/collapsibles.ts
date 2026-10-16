/**
 * Post-processes rendered markdown HTML to nest content into:
 * - Collapsible <section> blocks (triggered by <h2>)
 * - Collapsible question blocks (triggered by <h3>)
 */
export function wrapSectionsAndQuestions(html: string): string {
  const parts = html.split(/(<h[23][^>]*>[\s\S]*?<\/h[23]>)/gi);
  let out = "";
  let inSection = false;
  let inQuestion = false;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (/^<h2/i.test(part)) {
      if (inQuestion) {
        out += "</div></div>"; // close question-body and question
        inQuestion = false;
      }
      if (inSection) {
        out += "</div></section>"; // close section-body and section
        inSection = false;
      }
      out += `<section class="collapsible-section open">${part}<div class="section-body">`;
      inSection = true;
    } else if (/^<h3/i.test(part)) {
      if (inQuestion) {
        out += "</div></div>"; // close previous question-body and question
        inQuestion = false;
      }
      out += `<div class="collapsible-question open">${part}<div class="question-body">`;
      inQuestion = true;
    } else {
      out += part;
    }
  }

  if (inQuestion) {
    out += "</div></div>";
  }
  if (inSection) {
    out += "</div></section>";
  }

  return out;
}
