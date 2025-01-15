export interface EventMessage<Datatype = any> {
  data: Datatype;
}

export interface IMessageHandler<DataType = any, ReturnType = any> {
  (message: EventMessage<DataType>, messageId: string): Promise<ReturnType>;
}
