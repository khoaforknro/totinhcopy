// Sử dụng React từ global CDN
const { useState, useEffect, useRef, Fragment } = React;

// --- MOCK CONFIG DATA (Mày tự do sửa ở đây để đổi nội dung cá nhân) ---
const CONFIG = {
    countdownId: "love-2026",
    music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Thay link MP3 tình yêu của mày vào đây
    backgroundColor: "#ffa3e0",
    backgroundText: "LOVE YOU FOREVER ", // Chữ chạy nền Matrix
    textColor: { r: 255, g: 105, b: 180 },
    finalText: "Anh Yêu Em! ❤️\nChúc chúng mình mãi hạnh phúc nhé!",
    heartColor: "transparent",
    flameColor: "#ff3366"
};

// --- COMPONENT 1: MATRIX BACKGROUND TEXT ---
const MatrixBackground = ({ text, color }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;
        
        const resizeCanvas = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.scale(dpr, dpr);

            const fontSize = 16;
            const columns = Math.floor(w / 7);
            const drops = Array.from({ length: columns }, () => Math.floor(Math.random() * (h / fontSize)));
            const textIndices = Array.from({ length: columns }, () => Math.floor(Math.random() * text.length));

            const draw = () => {
                ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
                ctx.fillRect(0, 0, w, h);
                ctx.fillStyle = color;
                ctx.font = `${fontSize}px 'Roboto', Arial, sans-serif`;

                for (let i = 0; i < columns; i++) {
                    const char = text[textIndices[i] % text.length];
                    ctx.fillText(char, i * 10, drops[i] * fontSize);
                    drops[i]++;
                    textIndices[i]++;

                    if (drops[i] * fontSize > h && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                }
            };
            
            const interval = setInterval(draw, 33);
            return () => clearInterval(interval);
        };

        const cleanup = resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        return () => {
            window.removeEventListener("resize", resizeCanvas);
            cleanup && cleanup();
        };
    }, [text, color]);

    return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, zIndex: -1, backgroundColor: "black" }} />;
};

// --- COMPONENT 2: MATHEMATICAL HEART BLOOM EFFECT ---
const HeartBloomEffect = ({ text, rgbColor }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let w = window.innerWidth;
        let h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;

        // Công thức vẽ tim toán học
        const getHeartPoint = (angle) => {
            const scale = Math.max(10, Math.min(Math.min(w, h) / 40, 25));
            const x = 16 * Math.pow(Math.sin(angle), 3);
            const y = 13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle);
            return {
                x: w / 2 + x * scale,
                y: h / 2 - y * scale - h * 0.05
            };
        };

        let particles = [];
        const renderLoop = () => {
            ctx.clearRect(0, 0, w, h);
            
            // Sinh hạt tim nhỏ từ viền tim lớn
            if (particles.length < 150) {
                const angle = Math.random() * Math.PI * 2;
                const pt = getHeartPoint(angle);
                particles.push({
                    x: pt.x, y: pt.y,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    alpha: 1,
                    scale: 0.05 + Math.random() * 0.1
                });
            }

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.005;
            });
            particles = particles.filter(p => p.alpha > 0);

            // Vẽ các hạt tim nhỏ
            particles.forEach(p => {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.scale(p.scale, p.scale);
                ctx.beginPath();
                ctx.moveTo(0, -30);
                ctx.bezierCurveTo(25, -60, 60, -30, 0, 30);
                ctx.bezierCurveTo(-60, -30, -25, -60, 0, -30);
                ctx.fillStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${p.alpha})`;
                ctx.fill();
                ctx.restore();
            });

            // Vẽ chữ text ở giữa tâm tim
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "white";
            ctx.font = `bold ${Math.max(18, Math.min(w, h) * 0.04)}px 'Mali', sans-serif`;
            
            const lines = text.split('\n');
            lines.forEach((line, idx) => {
                ctx.fillText(line, w / 2, h / 2 + (idx - (lines.length - 1) / 2) * 30);
            });

            requestAnimationFrame(renderLoop);
        };

        renderLoop();
        const handleResize = () => {
            w = window.innerWidth; h = window.innerHeight;
            canvas.width = w; canvas.height = h;
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [text, rgbColor]);

    return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 10, pointerEvents: "none" }} />;
};

// --- COMPONENT 3: MOCK 3D COUNTDOWN SPACE (Thay cho ThreeJS phức tạp để chạy mượt mọi thiết bị) ---
const Countdown3DSpace = ({ onComplete }) => {
    const [timeLeft, setTimeLeft] = useState({ ngày: 0, giờ: 0, phút: 0, giây: 10 }); // Để test nhanh 10 giây rớt đài

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.giây > 0) return { ...prev, giây: prev.giây - 1 };
                clearInterval(timer);
                onComplete(); // Kích hoạt nổ tim khi đếm về 0
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [onComplete]);

    return (
        <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", zIndex: 5, color: "white" }}>
            <h1 style={{ fontFamily: "'Mali'", fontSize: "2.5rem", marginBottom: "20px", textShadow: "0 0 10px #ff3366" }}>Sắp Đến Giờ G Rồi Mày Ơi!</h1>
            <div style={{ display: "flex", gap: "20px" }}>
                {Object.entries(timeLeft).map(([unit, val]) => (
                    <div key={unit} style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", padding: "20px", borderRadius: "15px", minWidth: "90px", textAlign: "center", border: "1px solid rgba(255,255,255,0.2)" }}>
                        <span style={{ fontSize: "3rem", display: "block", fontWeight: "bold" }}>{val}</span>
                        <span style={{ fontSize: "0.9rem", textTransform: "uppercase" }}>{unit}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAIN APPLICATION COMPONENT ---
function App() {
    const [isCompleted, setIsCompleted] = useState(false);
    const audioRef = useRef(null);

    // Kích hoạt chơi nhạc tự động khi người dùng tương tác lần đầu
    useEffect(() => {
        const startAudio = () => {
            if (audioRef.current) {
                audioRef.current.play().catch(() => {});
            }
        };
        document.addEventListener("click", startAudio);
        return () => document.removeEventListener("click", startAudio);
    }, []);

    return (
        <Fragment>
            {/* Audio Engine */}
            <audio ref={audioRef} loop src={CONFIG.music} />

            {/* Matrix Background Effect */}
            <MatrixBackground text={CONFIG.backgroundText} color={CONFIG.backgroundColor} />

            {/* Core Workflow State */}
            {!isCompleted ? (
                <Countdown3DSpace onComplete={() => setIsCompleted(true)} />
            ) : (
                <HeartBloomEffect text={CONFIG.finalText} rgbColor={CONFIG.textColor} />
            )}
        </Fragment>
    );
}

// Khởi chạy ứng dụng React
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
