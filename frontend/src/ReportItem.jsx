import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Upload,
  Camera,
  ImagePlus,
  MapPin,
  CalendarDays,
  Clock3,
  FileText,
  Package,
  CheckCircle2,
  X,
  RefreshCw,
} from "lucide-react";

import api from "./api/axios";

const emptyForm = {
  category: "",
  title: "",
  description: "",
  location: "",
  date: "",
  time: "",
  image: null,
};

function ReportItem({ type, onBack }) {
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const isLost = type === "lost";

  // =====================================================
  // CAMERA CLEANUP
  // =====================================================

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: files ? files[0] : value,
    }));
  };

  // =====================================================
  // OPEN CAMERA
  // =====================================================

  const openCamera = async () => {
    setCameraError("");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          "Camera is not supported by this browser."
        );
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
          },
          audio: false,
        });

      streamRef.current = stream;

      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error("Camera error:", error);

      setCameraError(
        "Camera permission was denied or the camera is unavailable."
      );
    }
  };

  // =====================================================
  // CLOSE CAMERA
  // =====================================================

  const closeCamera = () => {
    stopCamera();
    setCameraOpen(false);
    setCameraError("");
  };

  // =====================================================
  // CAPTURE PHOTO
  // =====================================================

  const capturePhoto = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setCameraError(
        "Camera is not ready yet. Please wait."
      );
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError(
            "Unable to capture the photo."
          );
          return;
        }

        const file = new File(
          [blob],
          `camera-item-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        setFormData((previous) => ({
          ...previous,
          image: file,
        }));

        closeCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const removeImage = () => {
    setFormData((previous) => ({
      ...previous,
      image: null,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;

    if (!formData.image) {
      alert("Please upload or capture an item image.");
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();

      data.append("type", type);
      data.append("category", formData.category);
      data.append("title", formData.title);
      data.append(
        "description",
        formData.description
      );
      data.append(
        "location",
        formData.location
      );
      data.append("date", formData.date);
      data.append("time", formData.time);
      data.append("image", formData.image);

      const response = await api.post(
        "/items",
        data
      );

      alert(response.data.message);

      setFormData(emptyForm);

      form.reset();

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to submit item"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="report-page-premium">

      {/* ================================================= */}
      {/* TOP BAR */}
      {/* ================================================= */}

      <div className="report-topbar">

        <button
          className="report-back-button"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          Back to Home
        </button>

        <div className="report-step">
          <span>01</span>
          ITEM REPORT
        </div>

      </div>

      {/* ================================================= */}
      {/* MAIN CONTAINER */}
      {/* ================================================= */}

      <div className="report-container">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="report-header">

          <div>

            <div
              className={`report-status ${
                isLost ? "lost" : "found"
              }`}
            >
              <span></span>

              {isLost
                ? "LOST ITEM"
                : "FOUND ITEM"}
            </div>

            <h1>
              File a{" "}
              <span>
                {isLost ? "Lost" : "Found"}
              </span>{" "}
              Item Report
            </h1>

            <p>
              Provide accurate details and an image.
              Our campus AI system will use this
              information to identify possible matches.
            </p>

          </div>

          <div className="report-header-icon">
            <Package size={30} />
          </div>

        </div>

        {/* ================================================= */}
        {/* FORM */}
        {/* ================================================= */}

        <form
          className="report-form"
          onSubmit={handleSubmit}
        >

          {/* ================================================= */}
          {/* LEFT COLUMN */}
          {/* ================================================= */}

          <div className="report-main-column">

            {/* ================================================= */}
            {/* ITEM DETAILS */}
            {/* ================================================= */}

            <section className="form-section">

              <div className="section-title">

                <div className="section-icon">
                  <Package size={18} />
                </div>

                <div>
                  <h2>Item Details</h2>
                  <p>
                    Tell us about the item.
                  </p>
                </div>

              </div>

              <div className="form-grid">

                <div className="form-field">

                  <label>
                    Category <span>*</span>
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select category
                    </option>

                    <option value="backpack">
                      Backpack
                    </option>

                    <option value="bottle">
                      Bottle
                    </option>

                    <option value="laptop">
                      Laptop
                    </option>

                    <option value="phone">
                      Mobile Phone
                    </option>

                    <option value="book">
                      Book
                    </option>

                    <option value="wallet">
                      Wallet
                    </option>

                    <option value="keys">
                      Keys
                    </option>

                    <option value="earphones">
                      Earphones
                    </option>

                    <option value="id_card">
                      ID Card
                    </option>

                    <option value="other">
                      Other
                    </option>

                  </select>

                </div>

                <div className="form-field">

                  <label>
                    Item Title <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="title"
                    placeholder="Example: Black Wallet"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              <div className="form-field full">

                <label>
                  Description <span>*</span>
                </label>

                <textarea
                  name="description"
                  placeholder="Describe the item's color, brand, unique marks, contents or other useful details..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  required
                />

                <small>
                  More details can help the AI matching
                  system identify similar items.
                </small>

              </div>

            </section>

            {/* ================================================= */}
            {/* LOCATION & TIME */}
            {/* ================================================= */}

            <section className="form-section">

              <div className="section-title">

                <div className="section-icon">
                  <MapPin size={18} />
                </div>

                <div>
                  <h2>Location & Time</h2>

                  <p>
                    When and where did this happen?
                  </p>
                </div>

              </div>

              <div className="form-field full">

                <label>
                  Location <span>*</span>
                </label>

                <div className="input-with-icon">

                  <MapPin size={17} />

                  <input
                    type="text"
                    name="location"
                    placeholder="Example: College Library"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              <div className="form-grid">

                <div className="form-field">

                  <label>
                    Date <span>*</span>
                  </label>

                  <div className="input-with-icon">

                    <CalendarDays size={17} />

                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />

                  </div>

                </div>

                <div className="form-field">

                  <label>
                    Time <span>*</span>
                  </label>

                  <div className="input-with-icon">

                    <Clock3 size={17} />

                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    />

                  </div>

                </div>

              </div>

            </section>

          </div>

          {/* ================================================= */}
          {/* RIGHT COLUMN */}
          {/* ================================================= */}

          <aside className="report-side-column">

            {/* ================================================= */}
            {/* IMAGE SECTION */}
            {/* ================================================= */}

            <section className="upload-section">

              <div className="section-title">

                <div className="section-icon">
                  <ImagePlus size={18} />
                </div>

                <div>
                  <h2>Item Image</h2>

                  <p>
                    Upload or capture a clear photo.
                  </p>
                </div>

              </div>

              {!formData.image ? (

                <>

                  {/* ========================================= */}
                  {/* UPLOAD / CAMERA BUTTONS */}
                  {/* ========================================= */}

                  <div className="camera-upload-options">

                    <label
                      className="upload-box"
                      htmlFor="item-image"
                    >

                      <div className="upload-icon">
                        <Upload size={24} />
                      </div>

                      <strong>
                        Upload Image
                      </strong>

                      <span>
                        Choose from your device
                      </span>

                      <small>
                        JPG, JPEG, PNG or WEBP
                      </small>

                    </label>

                    <button
                      type="button"
                      className="camera-capture-button"
                      onClick={openCamera}
                    >

                      <div className="camera-icon">
                        <Camera size={24} />
                      </div>

                      <strong>
                        Take Photo
                      </strong>

                      <span>
                        Use your camera
                      </span>

                      <small>
                        Capture item directly
                      </small>

                    </button>

                  </div>

                  <input
                    ref={fileInputRef}
                    id="item-image"
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    required
                    style={{
                      display: "none",
                    }}
                  />

                </>

              ) : (

                <div className="image-preview">

                  <img
                    src={URL.createObjectURL(
                      formData.image
                    )}
                    alt="Selected item"
                  />

                  <div className="image-preview-overlay">

                    <span>
                      <CheckCircle2 size={16} />
                      Image selected
                    </span>

                    <button
                      type="button"
                      onClick={removeImage}
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>

                  </div>

                </div>

              )}

            </section>

            {/* ================================================= */}
            {/* AI INFO */}
            {/* ================================================= */}

            <section className="ai-info-card">

              <div className="ai-info-icon">
                <FileText size={19} />
              </div>

              <div>

                <strong>
                  AI-assisted matching
                </strong>

                <p>
                  Your image and report details are
                  compared with existing campus records
                  to find possible matches.
                </p>

              </div>

            </section>

            {/* ================================================= */}
            {/* SUBMIT */}
            {/* ================================================= */}

            <button
              className={`submit-report-button ${
                submitting ? "loading" : ""
              }`}
              type="submit"
              disabled={submitting}
            >

              {submitting ? (

                <>
                  <span className="submit-spinner"></span>

                  Submitting Report...
                </>

              ) : (

                <>
                  <CheckCircle2 size={18} />

                  Submit{" "}
                  {isLost ? "Lost" : "Found"} Report
                </>

              )}

            </button>

            <p className="required-note">
              <span>*</span> Required fields
            </p>

          </aside>

        </form>

      </div>

      {/* ================================================= */}
      {/* CAMERA MODAL */}
      {/* ================================================= */}

      {cameraOpen && (

        <div className="camera-modal">

          <div className="camera-modal-card">

            <div className="camera-modal-header">

              <div>

                <span className="camera-live-dot">
                  ● LIVE
                </span>

                <h2>
                  Take Item Photo
                </h2>

                <p>
                  Position the item clearly inside
                  the camera.
                </p>

              </div>

              <button
                type="button"
                onClick={closeCamera}
                className="camera-close-button"
              >
                <X size={20} />
              </button>

            </div>

            <div className="camera-preview">

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
              />

              <div className="camera-frame">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>

            </div>

            {cameraError && (

              <div className="camera-error">
                {cameraError}
              </div>

            )}

            <div className="camera-modal-actions">

              <button
                type="button"
                className="camera-cancel-button"
                onClick={closeCamera}
              >
                Cancel
              </button>

              <button
                type="button"
                className="capture-photo-button"
                onClick={capturePhoto}
              >
                <Camera size={19} />
                Capture Photo
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default ReportItem;