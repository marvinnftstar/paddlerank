import assert from "node:assert/strict";
import test from "node:test";
import {
  getSafeDiscordInviteUrl,
  getSafeFacebookUrl,
  getSafeLogoUrl,
  parseClubForm,
} from "../lib/clubs";

test("logo URLs must use HTTPS", () => {
  assert.equal(getSafeLogoUrl("https://example.com/logo.png"), "https://example.com/logo.png");
  assert.equal(getSafeLogoUrl("http://example.com/logo.png"), null);
  assert.equal(getSafeLogoUrl("javascript:alert(1)"), null);
});

test("Discord URLs accept only supported HTTPS invite formats", () => {
  assert.equal(getSafeDiscordInviteUrl("https://discord.gg/paddlerank"), "https://discord.gg/paddlerank");
  assert.equal(getSafeDiscordInviteUrl("https://discord.com/invite/paddlerank"), "https://discord.com/invite/paddlerank");
  assert.equal(getSafeDiscordInviteUrl("http://discord.gg/paddlerank"), null);
  assert.equal(getSafeDiscordInviteUrl("https://example.com/invite/paddlerank"), null);
  assert.equal(getSafeDiscordInviteUrl("https://discord.com/channels/123"), null);
});

test("Facebook URLs accept only supported HTTPS Page and Group formats", () => {
  assert.equal(getSafeFacebookUrl("https://facebook.com/paddlerank"), "https://facebook.com/paddlerank");
  assert.equal(getSafeFacebookUrl("https://www.facebook.com/groups/paddlerank"), "https://www.facebook.com/groups/paddlerank");
  assert.equal(getSafeFacebookUrl("https://fb.com/paddlerank"), "https://fb.com/paddlerank");
  assert.equal(getSafeFacebookUrl("http://facebook.com/paddlerank"), null);
  assert.equal(getSafeFacebookUrl("https://example.com/paddlerank"), null);
  assert.equal(getSafeFacebookUrl("https://facebook.com"), null);
  assert.equal(getSafeFacebookUrl("https://facebook.com/l.php?u=https://example.com"), null);
});

test("club form rejects an invalid optional URL instead of silently removing it", () => {
  const formData = new FormData();
  formData.set("club_name", "PaddleRank Club");
  formData.set("city", "Quezon City");
  formData.set("contact_person", "Club Owner");
  formData.set("contact_email", "owner@example.com");
  formData.set("description", "A friendly competitive club.");
  formData.set("logo_url", "http://example.com/logo.png");

  assert.equal(parseClubForm(formData), null);
});
