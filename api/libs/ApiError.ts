export default class ApiError extends Error {
  isExposed: boolean
  status: number

  constructor(message, status, isExposed = false) {
    super(message)

    this.isExposed = isExposed
    this.status = status
  }
}
