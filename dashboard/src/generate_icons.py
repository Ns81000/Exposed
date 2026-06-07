import os
from PIL import Image, ImageDraw

def get_bezier_point(p0, p1, p2, p3, t):
    x = (1-t)**3 * p0[0] + 3*(1-t)**2 * t * p1[0] + 3*(1-t) * t**2 * p2[0] + t**3 * p3[0]
    y = (1-t)**3 * p0[1] + 3*(1-t)**2 * t * p1[1] + 3*(1-t) * t**2 * p2[1] + t**3 * p3[1]
    return (x, y)

def generate_eye_image(size, stroke_width_ratio=2.0/24.0, color=(59, 130, 246, 255)):
    # Render at 10x scale for perfect anti-aliasing
    render_scale = 10
    render_size = size * render_scale
    
    # Create transparent image
    img = Image.new("RGBA", (render_size, render_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Scale factor from 24x24 viewbox to render size
    sf = render_size / 24.0
    stroke_width = int(stroke_width_ratio * render_size)
    if stroke_width < 1:
        stroke_width = 1
        
    # Define control points scaled to render size
    curves = [
        # Top-Left
        ((2*sf, 12*sf), (2*sf, 12*sf), (5*sf, 5*sf), (12*sf, 5*sf)),
        # Top-Right
        ((12*sf, 5*sf), (19*sf, 5*sf), (22*sf, 12*sf), (22*sf, 12*sf)),
        # Bottom-Right
        ((22*sf, 12*sf), (22*sf, 12*sf), (19*sf, 19*sf), (12*sf, 19*sf)),
        # Bottom-Left
        ((12*sf, 19*sf), (5*sf, 19*sf), (2*sf, 12*sf), (2*sf, 12*sf))
    ]
    
    # Generate points for all curves
    points = []
    steps = 100
    for p0, p1, p2, p3 in curves:
        for i in range(steps):
            t = i / float(steps)
            points.append(get_bezier_point(p0, p1, p2, p3, t))
    points.append(curves[-1][3]) # close the path
    
    # Draw outer eye shape
    draw.line(points, fill=color, width=stroke_width, joint="round")
    
    # Draw pupil (circle at 12,12 with radius 3)
    cx, cy = 12*sf, 12*sf
    r = 3*sf
    # The pupil stroke needs to match the outer stroke width
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=stroke_width)
    
    # Downscale using Lanczos for clean borders
    return img.resize((size, size), Image.Resampling.LANCZOS)

if __name__ == "__main__":
    # Target files and their sizes
    targets = [
        # Extension icons
        ("extension/icons/icon16.png", 16),
        ("extension/icons/icon48.png", 48),
        ("extension/icons/icon128.png", 128),
        
        # Dashboard public assets
        ("dashboard/public/favicon.png", 32),
        ("dashboard/public/apple-touch-icon.png", 180),
        ("dashboard/public/logo512.png", 512)
    ]

    # Base directory
    base_dir = r"c:\Users\Ns8pc\Music\Exposed"

    for rel_path, size in targets:
        abs_path = os.path.join(base_dir, rel_path)
        # Ensure directory exists
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        
        # Generate and save image
        img = generate_eye_image(size)
        img.save(abs_path, "PNG")
        print(f"Generated {abs_path} ({size}x{size})")

    # Generate favicon.ico (multi-resolution: 16x16, 32x32, 48x48)
    favicon_ico_path = os.path.join(base_dir, "dashboard/public/favicon.ico")
    sizes = [16, 32, 48]
    images = [generate_eye_image(s) for s in sizes]
    images[0].save(favicon_ico_path, format="ICO", sizes=[(s, s) for s in sizes], append_images=images[1:])
    print(f"Generated {favicon_ico_path} (Favicon.ico)")
