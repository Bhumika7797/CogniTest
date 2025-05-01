import cv2
import numpy as np
import mediapipe as mp

# Constants
FRAME_TIME = 1 / 30  # Assume 30 FPS
BLINK_THRESHOLD = 0.015
FIXATION_THRESHOLD = 0.01
SACCADE_THRESHOLD = 0.02

mp_face_mesh = mp.solutions.face_mesh

def calculate_distance(p1, p2):
    return np.linalg.norm(np.array(p1) - np.array(p2))

def get_landmark_position(landmark, image_width, image_height):
    return np.array([landmark.x * image_width, landmark.y * image_height])

def calculate_pupil_size(landmarks, eye_indices, image_width, image_height):
    eye_points = [get_landmark_position(landmarks[i], image_width, image_height) for i in eye_indices]
    eye_center = np.mean(eye_points, axis=0)
    distances = [calculate_distance(eye_center, pt) for pt in eye_points]
    return np.mean(distances)

def extract_features_from_images(image_list):
    eye_positions = []
    fixation_durations = []
    saccade_amplitudes = []
    blink_count = 0
    pupil_sizes_left = []
    pupil_sizes_right = []

    left_eye_indices = [33, 133, 159, 145]
    right_eye_indices = [362, 263, 386, 374]

    prev_eye_center = None
    fixation_duration = 0

    with mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1) as face_mesh:
        for img in image_list:
            image_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(image_rgb)
            if not results.multi_face_landmarks:
                continue

            landmarks = results.multi_face_landmarks[0].landmark
            h, w, _ = img.shape

            # Eye center
            left_eye_pts = [get_landmark_position(landmarks[i], w, h) for i in left_eye_indices]
            right_eye_pts = [get_landmark_position(landmarks[i], w, h) for i in right_eye_indices]
            left_center = np.mean(left_eye_pts, axis=0)
            right_center = np.mean(right_eye_pts, axis=0)
            eye_center = (left_center + right_center) / 2.0
            eye_positions.append(eye_center)

            # Pupil sizes
            pupil_sizes_left.append(calculate_pupil_size(landmarks, left_eye_indices, w, h))
            pupil_sizes_right.append(calculate_pupil_size(landmarks, right_eye_indices, w, h))

            # Blink detection
            left_lid_dist = calculate_distance(left_eye_pts[1], left_eye_pts[2])
            right_lid_dist = calculate_distance(right_eye_pts[1], right_eye_pts[2])
            if left_lid_dist < BLINK_THRESHOLD and right_lid_dist < BLINK_THRESHOLD:
                blink_count += 1

            # Saccades & fixations
            if prev_eye_center is not None:
                move_dist = calculate_distance(prev_eye_center, eye_center)
                if move_dist < FIXATION_THRESHOLD:
                    fixation_duration += FRAME_TIME
                else:
                    if fixation_duration > 0:
                        fixation_durations.append(fixation_duration)
                    fixation_duration = 0

                if move_dist > SACCADE_THRESHOLD:
                    saccade_amplitudes.append(move_dist)
            prev_eye_center = eye_center

    if fixation_duration > 0:
        fixation_durations.append(fixation_duration)

    # Final stats
    fixation_duration_total = np.sum(fixation_durations)
    num_fixations = len(fixation_durations)
    avg_fixation_duration = np.mean(fixation_durations) if fixation_durations else 0
    num_saccades = len(saccade_amplitudes)
    saccade_total = np.sum(saccade_amplitudes)
    avg_saccade_amplitude = np.mean(saccade_amplitudes) if saccade_amplitudes else 0
    avg_saccade_speed = np.mean([amp / FRAME_TIME for amp in saccade_amplitudes]) if saccade_amplitudes else 0
    avg_pupil_left = np.mean(pupil_sizes_left) if pupil_sizes_left else 0
    avg_pupil_right = np.mean(pupil_sizes_right) if pupil_sizes_right else 0

    # Return list of features with correct names:
    return [
        fixation_duration_total,       # FixationDuration
        avg_saccade_speed,             # SaccadeSpeed
        blink_count / len(image_list), # BlinkRate
        num_fixations,                 # Number of Fixations
        fixation_duration_total,       # Fixation Duration
        avg_fixation_duration,         # Average Fixation Duration
        num_saccades,                  # Number of Saccades
        saccade_total,                 # Saccade Amplitude
        avg_saccade_amplitude,         # Average Saccade Amplitude
        avg_pupil_left,                # Average Pupil Size (Left, mm)
        avg_pupil_right                # Average Pupil Size (Right, mm)
    ]



