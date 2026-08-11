import importlib.util
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).resolve().parents[1] / "scripts" / "import_ab50_ch.py"
spec = importlib.util.spec_from_file_location("import_ab50_ch", MODULE_PATH)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class SanitizerTests(unittest.TestCase):
    def test_active_markup_and_event_handlers_are_removed(self):
        hostile = """
        <div class="safe" onclick="alert(1)">
          <script>alert(1)</script><style>body{display:none}</style>
          <svg onload="alert(1)"><circle /></svg><object data="https://evil.example/x"></object>
          <form><input name="token"></form><p style="color:red">Visible copy</p>
        </div>
        """
        clean = module.sanitize_fragment(hostile)
        for token in ("<script", "<style", "<svg", "<object", "<form", "<input", "onclick=", "style="):
            self.assertNotIn(token, clean)
        self.assertIn("Visible copy", clean)

    def test_dangerous_urls_are_removed_and_safe_urls_survive(self):
        hostile = """
        <a href="javascript:alert(1)">bad</a>
        <a href="data:text/html,x">bad data</a>
        <a href="/partnersuche/zuerich">city</a>
        <a href="https://ab50.ch/?AID=location">register</a>
        <img src="javascript:alert(1)" onerror="alert(1)">
        <img src="https://evil.example/tracker.jpg">
        <img src="https://static-cms.icony-hosting.de/cms/safe.jpg" alt="safe">
        """
        clean = module.sanitize_fragment(hostile)
        self.assertNotIn("javascript:", clean)
        self.assertNotIn("data:text", clean)
        self.assertNotIn("evil.example", clean)
        self.assertNotIn("onerror", clean)
        self.assertIn('href="/partnersuche/zuerich"', clean)
        self.assertIn('href="https://ab50.ch/?AID=location"', clean)
        self.assertIn('src="https://static-cms.icony-hosting.de/cms/safe.jpg"', clean)


if __name__ == "__main__":
    unittest.main()
