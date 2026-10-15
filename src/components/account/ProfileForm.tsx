"use client";
import { useActionState } from "react";
import { saveProfile, type MState } from "@/actions/member";
import type { Profile } from "@/db/schema";

export default function ProfileForm({ p, uploads }: { p: Profile | null; uploads: boolean }) {
  const [st, act, pending] = useActionState<MState, FormData>(saveProfile, { ok: false, message: "" });
  return (
    <form className="form form--card" action={act}>
      <div className="f"><label htmlFor="p-dn">Display name</label><input id="p-dn" name="displayName" defaultValue={p?.displayName ?? ""} maxLength={40} required /></div>
      <div className="f"><label htmlFor="p-hl">Headline</label><input id="p-hl" name="headline" defaultValue={p?.headline ?? ""} placeholder="Sunset chaser, tango lover…" maxLength={120} /></div>
      <div className="f"><label htmlFor="p-city">City</label><input id="p-city" name="city" defaultValue={p?.city ?? ""} /></div>
      <div className="f"><label htmlFor="p-occ">Occupation</label><input id="p-occ" name="occupation" defaultValue={p?.occupation ?? ""} /></div>
      <div className="f"><label htmlFor="p-lang">Languages</label><input id="p-lang" name="languages" defaultValue={p?.languages ?? ""} placeholder="English, Spanish" /></div>
      <div className="f"><label htmlFor="p-int">Interests (comma separated)</label><input id="p-int" name="interests" defaultValue={p?.interests.join(", ") ?? ""} placeholder="Scuba, salsa, sailing" /></div>
      <div className="f f--full"><label htmlFor="p-bio">About me</label><textarea id="p-bio" name="bio" defaultValue={p?.bio ?? ""} maxLength={2000} /></div>
      <div className="f f--full"><label htmlFor="p-vid">Video link (optional)</label><input id="p-vid" name="videoUrl" type="url" defaultValue={p?.videoUrl ?? ""} placeholder="https://youtube.com/…" /></div>

      <div className="f f--full">
        <span className="label">Photos</span>
        {p?.photos.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 10 }}>
            {p.photos.map((ph) => (
              <label key={ph} style={{ position: "relative", display: "block", borderRadius: 14, overflow: "hidden", aspectRatio: "3/4", border: "1px solid var(--line)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ph} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <span style={{ position: "absolute", left: 6, bottom: 6, display: "flex", gap: 4, alignItems: "center", fontSize: ".7rem", background: "rgba(3,6,11,.7)", padding: "3px 6px", borderRadius: 8 }}><input type="checkbox" name="removePhoto" value={ph} /> remove</span>
              </label>
            ))}
          </div>
        ) : <span className="hint">No photos yet — profiles with photos get far more introductions.</span>}
        {uploads ? (
          <input name="photos" type="file" accept="image/*" multiple style={{ marginTop: 10 }} />
        ) : (
          <>
            <textarea name="photoUrls" placeholder="Paste https:// image links, one per line (uploads activate once BLOB_READ_WRITE_TOKEN is set)" style={{ marginTop: 10, minHeight: 70 }} />
          </>
        )}
      </div>

      <label className="check"><input type="checkbox" name="visible" defaultChecked={p?.visible ?? true} /> Show my profile to approved members</label>
      {st.message && <p className={`form-msg${st.ok ? "" : " is-err"}`} role="status">{st.message}</p>}
      <div className="f--full"><button className="btn btn--chrome" disabled={pending}>{pending ? "Saving…" : "Save profile"}</button></div>
    </form>
  );
}
