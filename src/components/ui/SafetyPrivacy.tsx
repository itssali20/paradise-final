/** "Your safety and privacy" — shared by About and Gentlemen so the promise reads the same everywhere. */
export default function SafetyPrivacy() {
  return (
    <section className="section--tight bg-abyss">
      <div className="container">
        <span className="caps caps--aqua eyebrow" data-reveal>Your safety and privacy</span>
        <h2 className="h2" style={{ marginTop: 18 }} data-split="words">Safety, privacy <em className="chrome">and comfort</em></h2>
        <p className="lead" style={{ marginTop: 20, maxWidth: "60ch" }} data-reveal>Guest safety, privacy, and comfort are important priorities.</p>
        <div className="trio" data-stagger>
          <div><b className="chrome-static">I</b><h3>Verified members</h3><p>Our membership procedures include identity verification and appropriate screening. Where legally permitted and operationally appropriate, additional background checks may be conducted.</p></div>
          <div><b className="chrome-static">II</b><h3>Clear standards</h3><p>Clear community standards and conduct policies, with reporting options for every member and guest.</p></div>
          <div><b className="chrome-static">III</b><h3>Always voluntary</h3><p>All introductions, activities, and romantic interactions are voluntary. Messaging opens only when both members agree.</p></div>
        </div>
        <p className="fine" style={{ marginTop: 30, maxWidth: "70ch" }} data-reveal>Screening cannot eliminate every risk, but responsible practices, clear conduct policies, and respect for personal boundaries are essential to the Paradise Club experience.</p>
      </div>
    </section>
  );
}
