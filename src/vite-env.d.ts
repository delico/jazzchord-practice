/// <reference types="vite/client" />

interface Navigator {
  requestMIDIAccess(): Promise<WebMidi.MIDIAccess>;
}

declare namespace WebMidi {
  interface MIDIAccess {
    inputs: MIDIInputMap;
    outputs: MIDIOutputMap;
    onstatechange: ((this: MIDIAccess, ev: MIDIConnectionEvent) => any) | null;
  }

  interface MIDIInputMap extends Map<string, MIDIInput> {}

  interface MIDIInput extends MIDIPort {
    onmidimessage: ((this: MIDIInput, ev: MIDIMessageEvent) => any) | null;
  }

  interface MIDIPort {
    id: string;
    manufacturer: string | null;
    name: string | null;
    type: MIDIPortType;
    version: string | null;
    state: MIDIPortDeviceState;
    connection: MIDIPortConnectionState;
    onstatechange: ((this: MIDIPort, ev: MIDIConnectionEvent) => any) | null;
  }

  interface MIDIMessageEvent extends Event {
    data: Uint8Array;
  }

  type MIDIPortType = "input" | "output";
  type MIDIPortDeviceState = "disconnected" | "connected";
  type MIDIPortConnectionState = "open" | "closed" | "pending";
}