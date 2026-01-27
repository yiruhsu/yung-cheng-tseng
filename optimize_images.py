import os
from PIL import Image

def optimize_images(directory):
    # 設定目標寬度（1920px 足夠呈現絕佳的細節）
    TARGET_WIDTH = 1920
    
    # 遍歷資料夾
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(('.webp', '.webp', '.png')):
                file_path = os.path.join(root, file)
                file_name, _ = os.path.splitext(file)
                output_path = os.path.join(root, f"{file_name}.webp")
                
                # 如果 WebP 已經存在，就跳過（避免重複跑）
                if os.path.exists(output_path):
                    continue

                try:
                    with Image.open(file_path) as img:
                        # 1. 調整尺寸 (如果寬度超過 1920px)
                        if img.width > TARGET_WIDTH:
                            ratio = TARGET_WIDTH / float(img.width)
                            new_height = int((float(img.height) * float(ratio)))
                            img = img.resize((TARGET_WIDTH, new_height), Image.Resampling.LANCZOS)
                            print(f"Resized: {file} -> width: {TARGET_WIDTH}px")
                        
                        # 2. 轉檔為 WebP，品質設定 85 (兼顧畫質與體積的甜蜜點)
                        # 對於書法和篆刻，85 的品質肉眼幾乎無法分辨差異
                        img.save(output_path, 'WEBP', quality=85)
                        
                        # 計算瘦身幅度
                        original_size = os.path.getsize(file_path) / 1024
                        new_size = os.path.getsize(output_path) / 1024
                        print(f"Converted: {file}")
                        print(f"  Old: {original_size:.2f} KB")
                        print(f"  New: {new_size:.2f} KB (省了 {100 - (new_size/original_size)*100:.1f}%)")
                        print("-" * 30)

                except Exception as e:
                    print(f"Error processing {file}: {e}")

if __name__ == "__main__":
    # 請確認這是你放圖片的資料夾名稱，通常是 'images'
    # 這裡假設你的圖片都在 images 資料夾下
    optimize_images('./images')