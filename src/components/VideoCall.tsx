"use client";

import { useEffect, useRef, useState } from "react";
import {
  StreamVideoClient,
  StreamCall,
  StreamTheme,
  CallControls,
  SpeakerLayout,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

export default function VideoCall({
  user,
  appointmentId,
}: {
  user: { id: string; name: string };
  appointmentId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [call, setCall] = useState<any>(null);
  const clientRef = useRef<StreamVideoClient | null>(null);
  const callRef = useRef<any>(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setPermissionsGranted(true);
      } catch (err) {
        setPermissionsGranted(false);
        setLoading(false);
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    if (!permissionsGranted) return;
    let mounted = true;

    const init = async () => {
      try {
        const res = await fetch("/api/stream-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id, name: user.name }),
        });
        const data = await res.json();
        if (!data.token) throw new Error("No token returned");

        const client = new StreamVideoClient({
          apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
          user,
          token: data.token,
        });
        clientRef.current = client;

        const callInstance = client.call("default", `appointment-${appointmentId}`);
        callRef.current = callInstance;
        await callInstance.join({ create: true });

        await callInstance.camera.enable();
        await callInstance.microphone.enable();

        if (mounted) setCall(callInstance);
      } catch (err) {
        console.error("Video init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const handleUnload = () => cleanupCall();
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      mounted = false;
      window.removeEventListener("beforeunload", handleUnload);
      cleanupCall();
    };
  }, [permissionsGranted, user.id, user.name, appointmentId]);

  const cleanupCall = async () => {
    const client = clientRef.current;
    const currentCall = callRef.current;

    try {
      if (currentCall) {
        await currentCall.camera.disable().catch(() => {});
        await currentCall.microphone.disable().catch(() => {});
        await currentCall.leave({ reason: "component_unmount" }).catch(() => {});
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      for (const device of devices) {
        if (device.kind === "videoinput" || device.kind === "audioinput") {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: device.kind === "audioinput",
              video: device.kind === "videoinput",
            });
            stream.getTracks().forEach((track) => track.stop());
          } catch {
            // ignore errors
          }
        }
      }

      if (client) await client.disconnectUser().catch(() => {});
    } catch (e) {
      console.warn("Cleanup error", e);
    }

    callRef.current = null;
    clientRef.current = null;
    setCall(null);
  };

  // --- UI / Styling only ---
  return (
    <div className="flex items-center justify-center min-h-[75vh] w-full bg-gray-950 text-white">
      <div className="w-full max-w-5xl h-[70vh] bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center border border-gray-800">
        {!permissionsGranted ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-red-400 text-lg font-medium mb-2">
              Camera and microphone permissions are required.
            </p>
            <p className="text-gray-400">Please allow access and reload the page.</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-full text-blue-400 text-lg font-semibold">
            Connecting to your call...
          </div>
        ) : !call ? (
          <div className="flex flex-col items-center justify-center h-full text-red-400 text-lg font-semibold">
            Failed to connect to the call.
          </div>
        ) : (
          <StreamTheme>
            <StreamCall call={call}>
              <div className="flex flex-col h-full w-full bg-gray-950">
                <div className="flex-1">
                  <SpeakerLayout />
                </div>
                <div className="border-t border-gray-800 bg-gray-900/80 backdrop-blur-md p-3">
                  <CallControls
                    onLeave={async () => {
                      await cleanupCall();
                    }}
                  />
                </div>
              </div>
            </StreamCall>
          </StreamTheme>
        )}
      </div>
    </div>
  );
}
