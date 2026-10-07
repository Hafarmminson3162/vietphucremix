/**
 * FILE CHUYÊN DÙNG ĐỂ CHỈNH SỬA / DÁN ẢNH BASE64 CHO CÁC MẪU TRANG PHỤC
 * 
 * Cách sử dụng:
 * 1. Chuyển ảnh thành chuỗi Base64 (ví dụ dạng "data:image/jpeg;base64,/9j/4AAQSkZJRg...")
 * 2. Dán chuỗi base64 vào giá trị tương ứng của trang phục bên dưới (dùng theo ID hoặc tên file).
 * 3. Nếu để chuỗi rỗng "", hệ thống sẽ tự động dùng ảnh mặc định từ thư mục public.
 */

export const COSTUME_BASE64_IMAGES: Record<string, string> = {
  // =========================================================================
  // --- I. BẢNG TRANG PHỤC DÀNH CHO NỮ (15 MẪU) ---
  // =========================================================================
  "f_cham_tay_nung": "", // 1. Bộ đồ chàm truyền thống (bộ đồ chàm truyền thống nữ.jpg)
  "f_ao_pan_muong": "",  // 2. Áo Pắn & Váy Mường (Áo Pắn & Váy Mường.jpg)
  "f_ao_com_thai": "",   // 3. Áo Cóm & Váy đen Thái (Áo Cóm & Váy đen Thái.jpg)
  "f_ao_mong": "",       // 4. Váy xòe & Áo Mông (Váy xòe & Áo Mông.jpg)
  "f_dao_do": "",        // 5. Trang phục Dao Đỏ (Trang phục Dao Đỏ nữ.jpg)
  "f_tay_nguyen": "",    // 6. Váy tấm & Áo ngắn Tây Nguyên (Váy tấm & Áo ngắn Tây Nguyên.jpg)
  "f_phuong_bao": "",    // 7. Áo Phượng Bào (Áo Phượng Bào nữ.jpg)
  "f_nhat_binh": "",     // 8. Áo Nhật Bình (Áo Nhật Bình nữ.jpg)
  "f_ao_yem": "",        // 9. Áo Yếm (áo yếm.jpg)
  "f_ao_tu_than": "",    // 10. Áo Tứ Thân Nữ (áo tứ thân nữ.jpg)
  "f_ao_ngu_than": "",   // 11. Áo Ngũ Thân Nữ (áo ngũ thân nữ.jpg)
  "f_ao_dai_cach_tan": "", // 12. Áo Dài Cách Tân Nữ (áo dài cách tân nữ.jpg)
  "f_ao_ba_ba": "",      // 13. Áo bà ba & Khăn rằn (áo bà ba và khăn rằn nữ.jpg)
  "f_cham": "",          // 14. Trang phục truyền thống Chăm (Trang phục truyền thống Chăm nữ.jpg)
  "f_suon_xam": "",      // 15. Sườn xám / Áo dài triều phục (sườn xám.jpg)

  // =========================================================================
  // --- II. BẢNG TRANG PHỤC DÀNH CHO NAM (17 MẪU) ---
  // =========================================================================
  "m_cham_tay_nung": "", // 16. Bộ đồ chàm truyền thống nam (Bộ đồ chàm truyền thống nam.jpg)
  "m_ao_cham_muong": "", // 17. Áo chàm & Quần rộng Mường nam (Áo chàm & Quần rộng Mường nam.jpg)
  "m_ao_cham_thai": "",  // 18. Áo chàm Thái nam (áo chàm thái nam.jpg)
  "m_ao_mong": "",       // 19. Áo khoác & Quần rộng Mông nam (Áo khoác & Quần rộng Mông nam.jpg)
  "m_dao_do": "",        // 20. Trang phục Dao Đỏ nam (Trang phục Dao Đỏ nam.jpg)
  "m_tay_nguyen": "",    // 21. Khố nam & Áo chui đầu (Khố nam & Áo chui đầu.jpg)
  "m_long_con": "",      // 22. Áo Long Cổn / Cổn phục (Áo Long Cổn (Cổn phục).jpg)
  "m_phi_ngu": "",       // 23. Áo Phi Ngư Phục (Áo Phi Ngư Phục.jpg)
  "m_vien_linh": "",     // 24. Áo Viên lĩnh / Đoàn lĩnh (Áo Viên lĩnh (Đoàn lĩnh).jpg)
  "m_giao_linh": "",     // 25. Áo Giao lĩnh / Tràng vạt (Áo Giao lĩnh (Tràng vạt).jpg)
  "m_doi_kham": "",      // 26. Áo Đối khâm (Áo Đối khâm.jpg)
  "m_ao_tu_than": "",    // 27. Áo Tứ Thân Nam (áo tứ thân nam.jpg)
  "m_ao_ngu_than": "",   // 28. Áo Ngũ Thân Nam / Tay chẽn (áo ngũ thân nam.jpg)
  "m_ao_dai_cach_tan": "", // 29. Áo Dài Cách Tân Nam (áo dài cách tân nam.jpg)
  "m_ao_ba_ba": "",      // 30. Áo bà ba & Khăn rằn nam (Áo bà ba & Khăn rằn nam.jpg)
  "m_cham": "",          // 31. Trang phục truyền thống Chăm nam (Trang phục truyền thống Chăm nam.jpg)
  "m_hoa": "",           // 32. Trang phục truyền thống Hoa (Trang phục truyền thống Hoa.jpg)
};
