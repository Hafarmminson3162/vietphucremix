export interface ProcessingPreset {
  id: string;
  name: string;
  category: 'accessories' | 'background' | 'enhance' | 'artistic';
  icon: string;
  description: string;
  prompt: string;
}

export const AI_PROCESSING_PRESETS: ProcessingPreset[] = [
  // 1. Phụ kiện di sản
  {
    id: 'non_quai_thao',
    name: 'Nón quai thao & lụa đào',
    category: 'accessories',
    icon: 'fa-hat-cowboy',
    description: 'Thêm nón quai thao truyền thống với dải lụa đào thắt mềm mại',
    prompt: 'Thêm chiếc nón quai thao truyền thống Kinh Bắc đội trên đầu, hai bên dải lụa đào buông rủ thướt tha, giữ nguyên ngũ quan khuôn mặt và cấu trúc hoa văn trang phục',
  },
  {
    id: 'non_la_hue',
    name: 'Nón lá bài thơ',
    category: 'accessories',
    icon: 'fa-umbrella',
    description: 'Nón lá chóp nhọn xứ Huế nghiêng vành duyên dáng',
    prompt: 'Thêm chiếc nón lá bài thơ xứ Huế mỏng nhẹ, đội nghiêng đầu duyên dáng, ánh sáng xuyên qua vành nón thanh tao hòa quyện cùng phục trang truyền thống',
  },
  {
    id: 'khan_ran',
    name: 'Khăn rằn Nam Bộ',
    category: 'accessories',
    icon: 'fa-scroll',
    description: 'Chiếc khăn rằn kẻ sọc đen trắng quấn cổ bình dị',
    prompt: 'Thêm chiếc khăn rằn Nam Bộ kẻ ca-rô truyền thống quàng nhẹ quanh cổ và vai, tôn vinh nét đẹp bình dị mộc mạc',
  },
  {
    id: 'quat_lua',
    name: 'Quạt lụa thêu hoa sen',
    category: 'accessories',
    icon: 'fa-fan',
    description: 'Chiếc quạt lụa tròn xếp cầm trên tay tinh tế',
    prompt: 'Người mẫu cầm trên tay một chiếc quạt lụa tròn truyền thống thêu đóa hoa sen thanh tao và chỉ kim tuyến, phong thái đoan trang đài các',
  },
  {
    id: 'hoa_sen_hong',
    name: 'Đóa sen hồng cầm tay',
    category: 'accessories',
    icon: 'fa-spa',
    description: 'Cầm trên tay đóa sen hồng tươi còn đọng sương',
    prompt: 'Hai tay nâng nhẹ một đóa sen hồng tươi ngát hương cùng búp sen xanh đọng giọt sương mai, tôn vinh cốt cách thanh khiết người Việt',
  },
  {
    id: 'kieng_bac',
    name: 'Vòng kiềng bạc cổ truyền',
    category: 'accessories',
    icon: 'fa-ring',
    description: 'Chiếc kiềng bạc tròn chạm khắc hoa văn cổ',
    prompt: 'Đeo một chiếc vòng kiềng bạc tròn truyền thống sáng bóng chạm khắc hoa văn thủy ba sóng nước nơi cổ áo, tăng vẻ quý phái quyền quý',
  },
  {
    id: 'khan_xep_hoang_gia',
    name: 'Khăn xếp gấm hoàng gia',
    category: 'accessories',
    icon: 'fa-crown',
    description: 'Khăn xếp ngũ sắc thêu chỉ kim tuyến hoàng gia',
    prompt: 'Đội khăn xếp truyền thống bằng vải gấm thêu chỉ ngũ sắc và sợi kim tuyến lấp lánh trang trọng, phong thái quý tộc cung đình',
  },

  // 2. Đổi bối cảnh di sản
  {
    id: 'bg_hoi_an',
    name: 'Phố cổ Hội An đèn lồng',
    category: 'background',
    icon: 'fa-lightbulb',
    description: 'Phố cổ lung linh hoa đăng rực rỡ buổi hoàng hôn',
    prompt: 'Thay đổi toàn bộ phông nền phía sau thành Phố cổ Hội An với những ngôi nhà cổ tường vàng mái ngói rêu phong, giàn hoa giấy và hàng trăm chiếc đèn lồng lụa lung linh rực rỡ buổi tối ấm áp',
  },
  {
    id: 'bg_hue',
    name: 'Cung đình Huế cổ kính',
    category: 'background',
    icon: 'fa-landmark',
    description: 'Điện Thái Hòa & lầu son gác tía Hoàng Thành',
    prompt: 'Thay đổi phông nền phía sau thành Cung đình Đại Nội Huế cổ kính, cột gỗ sơn son thếp vàng, bậc thềm rồng đá và sân chầu uy nghi trầm mặc',
  },
  {
    id: 'bg_ho_guom',
    name: 'Hồ Gươm sương mai tháp Rùa',
    category: 'background',
    icon: 'fa-water',
    description: 'Hồ Hoàn Kiếm sương sớm, hàng liễu rủ và hoa sen',
    prompt: 'Thay đổi phông nền thành Hồ Hoàn Kiếm Hà Nội sương sớm lãng đãng, hàng liễu rủ bóng xuống mặt nước phẳng lặng, xa xa là Tháp Rùa cổ kính mờ ảo',
  },
  {
    id: 'bg_sapa',
    name: 'Ruộng bậc thang Sa Pa',
    category: 'background',
    icon: 'fa-mountain-sun',
    description: 'Thung lũng ruộng bậc thang mây bay Tây Bắc',
    prompt: 'Thay đổi phông nền thành núi rừng Tây Bắc với ruộng bậc thang lúa vàng trải dài vô tận, mây trắng bồng bềnh uốn quanh sườn núi hùng vĩ',
  },
  {
    id: 'bg_song_nuoc',
    name: 'Miệt vườn sông nước miền Tây',
    category: 'background',
    icon: 'fa-ship',
    description: 'Bến sông quê, ghe xuồng chở hoa trái mùa nổi',
    prompt: 'Thay đổi phông nền thành khung cảnh miền Tây sông nước thanh bình, chiếc xuồng ba lá chở đầy bông súng và cây trái miệt vườn trĩu quả',
  },
  {
    id: 'bg_chua_mot_cot',
    name: 'Chùa Một Cột uy nghiêm',
    category: 'background',
    icon: 'fa-archway',
    description: 'Ngôi chùa đài sen nghìn năm Thăng Long',
    prompt: 'Thay đổi phông nền thành Chùa Một Cột cổ kính uy nghi vươn lên giữa hồ sen xanh ngát, ánh sáng ban mai tinh khôi linh thiêng',
  },

  // 3. Nâng cấp & Phục chế ảnh
  {
    id: 'enhance_8k_textiles',
    name: 'Làm nét hoa văn gấm lụa 8K',
    category: 'enhance',
    icon: 'fa-wand-magic',
    description: 'Siêu phân giải, sắc nét từng sợi chỉ kim tuyến',
    prompt: 'Nâng cấp chất lượng ảnh lên siêu độ phân giải 8K, làm cực kỳ sắc nét từng đường kim mũi chỉ thêu tay, hạt ngọc, sợi gấm tơ tằm và vân vải truyền thống, khuôn mặt tự nhiên mịn màng không bị biến dạng',
  },
  {
    id: 'restore_colors',
    name: 'Phục chế màu sắc di sản',
    category: 'enhance',
    icon: 'fa-palette',
    description: 'Phục chế màu tươi mới, khử mờ đục theo gam màu cổ',
    prompt: 'Phục chế toàn diện bức ảnh: cân bằng ánh sáng, khử mờ đục, tái hiện màu sắc son đỏ, xanh chàm, vàng hoàng yến rực rỡ và chân thực đúng chuẩn mỹ thuật cung đình truyền thống',
  },
  {
    id: 'golden_hour_lighting',
    name: 'Ánh nắng hoàng hôn Golden Hour',
    category: 'enhance',
    icon: 'fa-sun',
    description: 'Ánh sáng vàng ấm áp tạo khối nghệ thuật',
    prompt: 'Thêm hiệu ứng ánh sáng hoàng hôn ấm áp (golden hour) chiếu xiên nhẹ nhàng tạo viền sáng dịu mắt (rim light) quanh mái tóc và bờ vai, tăng chiều sâu nghệ thuật thị giác',
  },
  {
    id: 'portrait_bokeh',
    name: 'Xóa phông Bokeh nghệ thuật',
    category: 'enhance',
    icon: 'fa-camera-retro',
    description: 'Làm mờ nền mềm mại, chủ thể nổi bật tuyệt đối',
    prompt: 'Tạo hiệu ứng xóa phông quang học cinematic bokeh mềm mại ở hậu cảnh, giữ chủ thể và trang phục cổ truyền sắc nét nổi bật',
  },

  // 4. Phong cách nghệ thuật di sản
  {
    id: 'style_son_mai',
    name: 'Tranh sơn mài thếp vàng',
    category: 'artistic',
    icon: 'fa-brush',
    description: 'Chất liệu sơn ta then, son đỏ và thếp vàng lộng lẫy',
    prompt: 'Biến đổi toàn bộ bức ảnh sang phong cách Tranh sơn mài nghệ thuật truyền thống Việt Nam: sắc đen huyền của then, đỏ trầm của son, điểm xuyết vàng lá và bạc thếp lộng lẫy, bề mặt nhẵn bóng kỳ ảo',
  },
  {
    id: 'style_tranh_lua',
    name: 'Tranh lụa cổ Việt Nam',
    category: 'artistic',
    icon: 'fa-feather-pointed',
    description: 'Màu nước trên nền lụa tơ tằm thanh thoát',
    prompt: 'Biến đổi bức ảnh thành phong cách Tranh lụa cổ điển Việt Nam: nét vẽ mềm mại thanh tao, gam màu dịu ngọt loang trên thớ lụa tự nhiên, vẻ đẹp thoát tục hoài niệm',
  },
  {
    id: 'style_film_vintage',
    name: 'Ảnh phim hoài niệm thập niên 90',
    category: 'artistic',
    icon: 'fa-film',
    description: 'Hạt film grain ấm áp, màu sắc ký ức xưa',
    prompt: 'Biến đổi bức ảnh thành bức ảnh chụp bằng máy phim cơ cổ điển thập niên 90, hạt film grain mịn ấm áp, độ tương phản dịu mắt, sắc màu nhuốm màu thời gian hoài niệm',
  },
  {
    id: 'style_dong_ho',
    name: 'Tranh khắc gỗ dân gian Đông Hồ',
    category: 'artistic',
    icon: 'fa-stamp',
    description: 'Nét khắc gỗ mộc mạc trên giấy điệp óng ánh',
    prompt: 'Biến đổi phong cách thành Tranh dân gian Đông Hồ: đường viền nét khắc gỗ đen dày dặn mộc mạc, màu sắc tự nhiên từ hoa hòe, sỏi son trên nền giấy điệp óng ánh vỏ sò truyền thống',
  },
];
