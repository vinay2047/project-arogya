export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 px-6 py-20">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-orange-900">About Arogya</h1>
          <p className="text-orange-700 max-w-2xl mx-auto">
            A smarter, unified digital healthcare platform for patients and doctors.
          </p>
        </div>

        {/* Intro */}
        <p className="text-lg text-orange-800 leading-relaxed">
          Arogya is a comprehensive digital healthcare solution designed to streamline
          communication between doctors and patients. It tackles the challenges of
          inefficient appointment management, medical record handling, and remote
          consultations by enabling secure authentication, effortless document sharing,
          AI-powered document processing, and real-time guidance — all within one platform.
        </p>

        {/* Mission + Objectives */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-orange-900">Our Mission</h2>
          <p className="text-orange-800">
            To make healthcare access simpler, faster, and more reliable through seamless
            digital interactions, intelligent automation, and patient-centric design.
          </p>

          <h3 className="text-xl font-semibold text-orange-900">
            What We Aim to Solve
          </h3>
          <ul className="list-disc list-inside space-y-2 text-orange-800">
            <li>Improve communication between doctors and patients.</li>
            <li>Provide secure and organized medical record storage and access.</li>
            <li>Enable remote consultations and digital document workflows.</li>
            <li>Reduce wait times and simplify appointment scheduling.</li>
            <li>Build a user-friendly, secure, and scalable healthcare platform.</li>
          </ul>
        </div>

        {/* Target Audience */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-orange-900">Who We Serve</h2>
          <ul className="list-disc list-inside space-y-2 text-orange-800">
            <li><strong>Patients:</strong> Access doctors, medical records, appointments, and payment options through one app.</li>
            <li><strong>Doctors & Clinics:</strong> Manage appointments, documents, and consultations efficiently with smart tools.</li>
          </ul>
        </div>

        {/* Expected Outcome */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-orange-900">Our Vision</h2>
          <p className="text-orange-800 leading-relaxed">
            Arogya aims to simplify healthcare access by providing a one-stop digital
            platform for consultations, medical documentation, and secure communication.
            We envision reduced hospital waiting times, faster emergency support, and
            improved patient experience through meaningful digital transformation.
          </p>
        </div>
      </div>
    </div>
  );
}