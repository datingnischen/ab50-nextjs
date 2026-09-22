"use client";

import Image from "next/image";
import { useRef } from "react";

type CityImageDialogProps = {
  city: string;
  imageUrl: string;
  imageAlt: string;
  registrationUrl: string;
  /** Bildklasse des Ausloesers - Standard ist das hochformatige Hero-Format. */
  imageClassName?: string;
  /** Beschriftung des Zoom-Hinweises. */
  hint?: string;
  /** Nur setzen, wenn das Bild oberhalb der Falz liegt. */
  priority?: boolean;
};

export function CityImageDialog({
  city,
  imageUrl,
  imageAlt,
  registrationUrl,
  imageClassName = "city-phone-image",
  hint = "Bild vergrößern",
  priority = false,
}: CityImageDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        className="city-image-dialog-trigger"
        aria-label={`Stadtbild von ${city} vergrößern`}
        onClick={openDialog}
      >
        <Image
          priority={priority}
          src={imageUrl}
          alt={imageAlt}
          width={1000}
          height={667}
          className={imageClassName}
          sizes="(max-width: 980px) 100vw, 720px"
        />
        <span className="city-image-dialog-hint" aria-hidden="true">{hint}</span>
      </button>

      <dialog
        ref={dialogRef}
        className="city-image-dialog"
        aria-labelledby="city-image-dialog-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
      >
        <div className="city-image-dialog-panel">
          <button
            type="button"
            className="city-image-dialog-close"
            aria-label="Bilddialog schließen"
            onClick={closeDialog}
          >
            ×
          </button>
          <div className="city-image-dialog-image-wrap">
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={1600}
              height={1067}
              className="city-image-dialog-image"
              sizes="(max-width: 900px) 94vw, 1200px"
            />
          </div>
          <div className="city-image-dialog-copy">
            <div>
              <p className="eyebrow">Partnersuche ab 50 · Schweiz</p>
              <h2 id="city-image-dialog-title">Singles in {city} kennenlernen</h2>
              <p>Entdecke Menschen aus {city} und Umgebung und starte kostenlos.</p>
            </div>
            <a className="button-primary" href={registrationUrl}>Kostenlos registrieren</a>
          </div>
        </div>
      </dialog>
    </>
  );
}
