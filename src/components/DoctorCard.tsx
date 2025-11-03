interface DoctorCardProps {
  doctor: any; // full doctor object
  onSelect: () => void;
}

export default function DoctorCard({ doctor, onSelect }: DoctorCardProps) {
  return (
    <div className="bg-white shadow rounded-xl p-4 flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-lg">{doctor.doctor_code}</h3>
        {doctor.specialization && <p className="text-gray-600">Specialization: {doctor.specialization}</p>}
        {doctor.experience_years != null && <p className="text-gray-600">Experience: {doctor.experience_years} years</p>}
        {doctor.hpr_id && <p className="text-gray-600">HPR ID: {doctor.hpr_id}</p>}
        {doctor.license_number && <p className="text-gray-600">License: {doctor.license_number}</p>}
        {doctor.verified_by_admin && <p className="text-green-600 font-semibold">Verified</p>}
        {!doctor.verified_by_admin && <p className="text-yellow-600 font-semibold">Pending Verification</p>}
      </div>

      <button
        onClick={onSelect}
        className="mt-3 bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
      >
        Select
      </button>
    </div>
  );
}
