"use client";

import Image from "next/image";
import { useRef } from "react";

type CityImageDialogProps = {
  city: string;
  imageUrl: string;
  imageAlt: string;
  registrationUrl: string;
};

export function CityImageDialog({ city, imageUrl, imageAlt, registrationUrl }: CityImageDialogProps) {
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
          priority
          src={imageUrl}
          alt={imageAlt}
          width={1000}
          height={667}
          className="city-phone-image"
          sizes="(max-width: 980px) 100vw, 420px"
        />
        <span className="city-image-dialog-hint" aria-hidden="true">Bild vergrößern</span>
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
