'use client';

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import CreateEventForm from "@/components/CreateEventForm";

const CreateEventModalContext = createContext<{ openCreateEvent: () => void } | null>(null);

export const useCreateEventModal = () => {
    const ctx = useContext(CreateEventModalContext);
    if (!ctx) throw new Error("useCreateEventModal must be used inside <CreateEventModalProvider>");
    return ctx;
};

const CreateEventModalProvider = ({ children }: { children: React.ReactNode }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const [open, setOpen] = useState(false);

    const openCreateEvent = useCallback(() => setOpen(true), []);
    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    const value = useMemo(() => ({ openCreateEvent }), [openCreateEvent]);

    return (
        <CreateEventModalContext.Provider value={value}>
            {children}

            {/* No backdrop-click close on purpose: a long form shouldn't vanish on a stray click */}
            <dialog id="create-event-modal" ref={dialogRef} aria-labelledby={titleId} onClose={close}>
                {open && (
                    <div className="create-body">
                        <div className="create-head">
                            <div>
                                <h2 id={titleId} className="create-title">Create an event</h2>
                                <p className="create-sub">Share your event with the community.</p>
                            </div>
                            <button type="button" className="create-close" onClick={close} aria-label="Close">
                                &times;
                            </button>
                        </div>

                        <CreateEventForm onClose={close} />
                    </div>
                )}
            </dialog>
        </CreateEventModalContext.Provider>
    );
};

export default CreateEventModalProvider;