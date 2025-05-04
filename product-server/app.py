from datetime import datetime
from flask import Flask, request, jsonify, abort, send_from_directory, redirect
from flask_sqlalchemy import SQLAlchemy
import py_eureka_client.eureka_client as eureka_client
from models import db, Product, Order, OrderProduct

app = Flask(__name__, static_folder='static')

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///products.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

eureka_client.init(
  eureka_server="http://localhost:8761/eureka",
  app_name="PRODUCT-SERVICE",
  instance_port=5000,
  instance_host="localhost",
  health_check_url="http://localhost:5000/api/products/health",
  status_page_url="http://localhost:5000/",
  home_page_url="http://localhost:5000/"
)

with app.app_context():
  db.create_all()

@app.before_request
def before_request():
    print("Before Request: %s %s", request.method, request.path)

@app.route('/api/products/health')
def health():
  return jsonify({"status": "UP"})

@app.route('/api/documentation')
def redirect_to_products_docs():
  return redirect('/api/products/documentation', code=302)

@app.route('/api/products/documentation')
def documentation():
    return send_from_directory('static', 'documentation.html')

@app.route('/api/products/new', methods=['POST'])
def create_product():
  data = request.get_json()
  data['owner_id'] = int(request.headers.get('User-Id'))
  print(data)
  if not data or not 'name' in data or not 'price' in data or not 'owner_id' in data:
    abort(400, 'Missing required fields: name, price, or owner_id')
  
  image = data.get('image', '')
  if len(image) > 255:
    image = ''

  product = Product(
    name=data['name'],
    price=data['price'],
    description=data.get('description', ''),
    stock=data.get('stock', 0),
    owner_id=data['owner_id'],
    image=image
  )
  
  db.session.add(product)
  db.session.commit()
  
  return jsonify(product.to_dict()), 201

@app.route('/api/products/all', methods=['GET'])
def get_products():
  user_id = int(request.headers.get('User-Id'))
  products = Product.query.filter(Product.owner_id != user_id).all()
  return jsonify([product.to_dict() for product in products])

@app.route('/api/products/my-products', methods=['GET'])
def get_my_products():
  products = Product.query.filter_by(owner_id=int(request.headers.get('User-Id'))).all()
  return jsonify([product.to_dict() for product in products])

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
  product = Product.query.get(product_id)
  if not product:
    abort(404, 'Product not found')
  return jsonify(product.to_dict())

# UPDATE
@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.get_json()
    product = Product.query.get(product_id)
    if not product:
        abort(404, 'Product not found')
    
    if 'name' in data:
        product.name = data['name']
    if 'price' in data:
        product.price = data['price']
    if 'description' in data:
        product.description = data['description']
    if 'stock' in data:
        product.stock = data['stock']
    if 'owner_id' in data:
        product.owner_id = data['owner_id']
    if 'image' in data:
        product.image = data['image']

    db.session.commit()
    return jsonify(product.to_dict())

# DELETE
@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
  product = Product.query.get(product_id)
  if not product:
    abort(404, 'Product not found')
  
  db.session.delete(product)
  db.session.commit()
  return jsonify({"message": "Product deleted"})

@app.route('/api/orders/purchase', methods=['POST'])
def purchase_order():
  data = request.get_json()
  user_id = request.headers.get('User-Id')
  products = data.get('products')

  if not user_id or not products:
    return jsonify({'error': 'Missing user_id or products'}), 400

  total_price = 0.0
  order_products = []

  for item in products:
    product = Product.query.get(item['product_id'])
    if not product:
      return jsonify({'error': f'Product with id {item["product_id"]} not found'}), 404
    if product.stock < item['quantity']:
      return jsonify({'error': f'Insufficient stock for product {product.name}'}), 400

    # Update stock
    product.stock -= item['quantity']
    db.session.add(product)

    price = product.price * item['quantity']
    total_price += price

    order_products.append(OrderProduct(
      product_id=product.id,
      quantity=item['quantity'],
      price=product.price,  # snapshot of price at time of purchase
      product_name=product.name,
      product_description=product.description,
      product_image=product.image
    ))

  new_order = Order(
    user_id=user_id,
    total_price=total_price,
    order_date=datetime.utcnow()
  )
  db.session.add(new_order)
  db.session.flush()  # to get new_order.id

  for op in order_products:
    op.order_id = new_order.id
    db.session.add(op)

  db.session.commit()

  return jsonify({'message': 'Order placed', 'order_id': new_order.id}), 201


@app.route('/api/orders/all', methods=['GET'])
def get_orders():
  orders = Order.query.filter(Order.user_id == int(request.headers.get('User-Id'))).all()
  result = []
  for order in orders:
    order_data = {
      'id': order.id,
      'user_id': order.user_id,
      'total_price': order.total_price,
      'order_date': order.order_date.isoformat(),
      'archived': order.archived,
      'products': [{
        'product_id': op.product_id,
        'quantity': op.quantity,
        'price': op.price,
        'product_name': op.product_name,
        'product_description': op.product_description,
        'product_image': op.product_image
      } for op in order.products]
    }
    result.append(order_data)
  return jsonify(result)


@app.route('/api/orders/<int:id>', methods=['GET'])
def get_order(id):
  order = Order.query.filter(
    Order.id == id,
    Order.user_id == int(request.headers.get('User-Id'))
  ).first()

  if not order:
    abort(404)
  
  order_data = {
    'id': order.id,
    'user_id': order.user_id,
    'total_price': order.total_price,
    'order_date': order.order_date.isoformat(),
    'archived': order.archived,
    'products': [{
      'product_id': op.product_id,
      'quantity': op.quantity,
      'price': op.price,
      'product_name': op.product_name,
      'product_description': op.product_description,
      'product_image': op.product_image
    } for op in order.products]
  }
  return jsonify(order_data)

@app.route('/', methods=['GET'])
def default():
    return redirect('/api/products/documentation', code=302)

if __name__ == '__main__':
    app_thread = threading.Thread(target=lambda: app.run(host='0.0.0.0', port=5000, debug=True))
    app_thread.start()

    # Give Flask time to boot
    time.sleep(2)  # ← small wait
    register_to_eureka()

    app_thread.join()