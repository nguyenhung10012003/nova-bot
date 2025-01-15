import { Injectable } from '@nestjs/common';
import { FlowiseApi } from '@nova/flowise-api';

@Injectable()
export class AppService {
  private readonly flowiseApi: FlowiseApi;
  constructor() {
    this.flowiseApi = new FlowiseApi({
      baseUrl: 'https://milos.id.vn',
    });
  }
  getHello(): string {
    return 'Công nghệ thông tin (CNTT) đã trở thành một phần không thể thiếu trong cuộc sống hiện đại, đóng vai trò quan trọng trong hầu hết các lĩnh vực từ giáo dục, y tế, kinh tế đến giải trí. Sự phát triển nhanh chóng của CNTT đã mang lại những tiến bộ vượt bậc, giúp con người kết nối, làm việc và học tập hiệu quả hơn. Internet, điện toán đám mây, trí tuệ nhân tạo và dữ liệu lớn là những thành tựu nổi bật, mở ra nhiều cơ hội và thách thức mới. Tuy nhiên, bên cạnh những lợi ích to lớn, CNTT cũng đặt ra các vấn đề về bảo mật thông tin, quyền riêng tư và sự phụ thuộc quá mức vào công nghệ. Để tận dụng tối đa tiềm năng của CNTT, cần có sự cân bằng giữa phát triển công nghệ và đảm bảo các giá trị nhân văn, xã hội.';
  }

  async getPrediction() {
    const prediction = await this.flowiseApi.createPrediction({
      chatflowId: '245058be-2922-45a8-b721-4534e59b54b4',
      question: 'Núi nào cao nhất thế giới?',
      streaming: false,
    });
    console.log(prediction);
    return 'Prediction';
  }
}
