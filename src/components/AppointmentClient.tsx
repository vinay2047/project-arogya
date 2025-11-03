"use client";

import { useState } from "react";
import VideoCall from "@/components/VideoCall";
import ChatRoom from "@/components/ChatRoom";

export default function AppointmentClient({
  user,
  appointment,
  doctorName,
}: {
  user: any;
  appointment: any;
  doctorName: string;
}) {
  const [showChat, setShowChat] = useState(false);
  const [showCall, setShowCall] = useState(false);

  const isDoctor = user.id === appointment.doctor_id;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-8 px-4 space-y-6">
      <h1 className="text-2xl font-semibold text-center">
        Appointment #{appointment.id}
      </h1>

      <div className="text-center space-y-1">
        <p>
          <strong>Doctor:</strong> {doctorName}
        </p>
        <p>
          <strong>Scheduled At:</strong>{" "}
          {new Date(appointment.scheduled_at).toLocaleString()}
        </p>
        <p>
          You are logged in as:{" "}
          <span className="font-semibold">{isDoctor ? "Doctor" : "Patient"}</span>
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => setShowChat((prev) => !prev)}
          className={`px-6 py-2 rounded-lg font-semibold shadow-md transition ${
            showChat ? "bg-gray-300 text-gray-800" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {showChat ? "Close Chat" : "Join Chat"}
        </button>

        <button
          onClick={() => setShowCall((prev) => !prev)}
          className={`px-6 py-2 rounded-lg font-semibold shadow-md transition ${
            showCall ? "bg-gray-300 text-gray-800" : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {showCall ? "Leave Call" : "Join Call"}
        </button>
      </div>

      {/* Conditional render for Chat and Call */}
      {showCall && (
        <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-lg mt-6">
          <VideoCall
            user={{ id: user.id, name: user.user_metadata.full_name }}
            appointmentId={appointment.id}
          />
        </div>
      )}

      {showChat && (
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-md p-4 mt-6">
          <ChatRoom
            user={{ id: user.id, name: user.user_metadata.full_name }}
            doctorId={appointment.doctor_id}
            patientId={appointment.patient_id}
            appointmentId={appointment.id}
          />
        </div>
      )}
    </div>
  );
}
