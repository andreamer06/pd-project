from flask import Flask, render_template, Response, jsonify, request
import cv2
import mediapipe as mp
import os

app = Flask(__name__)

# Check if running on Render (No GUI support)
ON_RENDER = os.environ.get("RENDER") is not None

if not ON_RENDER:
    import pyautogui
    screen_width, screen_height = pyautogui.size()
else:
    screen_width = screen_height = None  # Dummy values

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands()

camera = cv2.VideoCapture(0)

mode = "None"  
current_action = "Waiting for gesture..."
prev_x, prev_y = None, None  


def generate_frames():
    global current_action, prev_x, prev_y, mode
    while True:
        success, image = camera.read()
        if not success:
            break
        else:
            image = cv2.flip(image, 1)
            image_height, image_width, _ = image.shape
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            output_hands = hands.process(rgb_image)
            all_hands = output_hands.multi_hand_landmarks

            if all_hands and not ON_RENDER:
                for hand in all_hands:
                    mp_drawing.draw_landmarks(image, hand, mp_hands.HAND_CONNECTIONS)
                    landmarks = hand.landmark

                    x1 = y1 = x2 = y2 = 0
                    for id, lm in enumerate(landmarks):
                        x = int(lm.x * image_width)
                        y = int(lm.y * image_height)

                        if id == 8:  # Index Finger Tip
                            x1, y1 = x, y
                        if id == 4:  # Thumb Tip
                            x2, y2 = x, y

                    distance = ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5
                    
                    # Map hand position to screen size
                    screen_x = int((x1 / image_width) * screen_width)
                    screen_y = int((y1 / image_height) * screen_height)
                    pyautogui.moveTo(screen_x, screen_y)
                    current_action = "Moving Mouse"
                    
                    # Click if index and thumb are close together
                    if distance < 30:
                        pyautogui.click()
                        current_action = "Mouse Clicked"
                    
                    if mode == "game":
                        if prev_x is not None and prev_y is not None:
                            dx = x1 - prev_x
                            dy = y1 - prev_y
                            if dy < -40:
                                current_action = "up"
                            elif dy > 40:
                                current_action = "down"
                            elif dx < -40:
                                current_action = "left"
                            elif dx > 40:
                                current_action = "right"

                        prev_x, prev_y = x1, y1

                    elif mode == "volume":
                        if distance > 50:
                            pyautogui.press("volumeup")
                            current_action = "Increasing Volume"
                        else:
                            pyautogui.press("volumedown")
                            current_action = "Decreasing Volume"

            ret, buffer = cv2.imencode('.jpg', image)
            image = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + image + b'\r\n')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/video')
def video():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/set_mode', methods=['POST'])
def set_mode():
    global mode
    mode = request.json.get("mode", "None")
    return jsonify({"mode": mode})


@app.route('/game_action')
def game_action():
    global current_action
    return jsonify({"direction": current_action})


if __name__ == '__main__':
    if ON_RENDER:
        from waitress import serve
        serve(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
    else:
        app.run(debug=True)
